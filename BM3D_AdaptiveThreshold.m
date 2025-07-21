function [y_est] = BM3D_AdaptiveThreshold(z, sigma, params)
% BM3D_AdaptiveThreshold - 改进版自适应阈值BM3D算法，专注于提高PSNR
% 兼容新版MATLAB的BM3D接口
%
% 输入参数:
%   z - 含噪图像
%   sigma - 噪声标准差或PSD
%   params - 可选参数结构体:
%     .tau_base - 基础阈值(默认为3000)
%     .alpha - 熵权重(默认为0.4)
%     .beta - 梯度权重(默认为0.4)
%     .gamma - 方差权重(默认为0.2)
%     .edge_protection - 边缘保护强度(默认为0.8)
%     .detail_boost - 细节增强系数(默认为0.3)
%     .profile - BM3D配置文件(默认为'np')
%
% 输出:
%   y_est - 去噪后的图像

if nargin < 2
    error('至少需要图像和噪声标准差两个参数');
end
if ~exist('params', 'var') || isempty(params)
    params = struct();
end
if ~isfield(params, 'tau_base'), params.tau_base = 3000; end
if ~isfield(params, 'alpha'), params.alpha = 0.4; end
if ~isfield(params, 'beta'), params.beta = 0.4; end
if ~isfield(params, 'gamma'), params.gamma = 0.2; end
if ~isfield(params, 'edge_protection'), params.edge_protection = 0.8; end
if ~isfield(params, 'detail_boost'), params.detail_boost = 0.3; end
if ~isfield(params, 'profile'), params.profile = 'np'; end

[~, ~, channels] = size(z);
if channels > 1
    y_est = zeros(size(z));
    for c = 1:channels
        y_est(:,:,c) = processChannelImproved(z(:,:,c), sigma, params);
    end
else
    y_est = processChannelImproved(z, sigma, params);
end
end

function y_est = processChannelImproved(z, sigma, params)
% 多尺度BM3D + 多特征自适应阈值 + 动态参数

% 1. 多尺度预处理
z_small = imresize(z, 0.5, 'bilinear');
z_large = imresize(z, 2, 'bilinear');

% 2. 特征提取
z_pre = fastPreDenoise(z, sigma);
[entropy_map, gradient_map] = calculateLocalFeatures(z_pre, 7);
local_var = stdfilt(z_pre, true(5)); % 局部方差
local_var = local_var / (max(local_var(:)) + eps);

% 3. 多特征自适应阈值
tau_adaptive = computeAdaptiveThresholdMulti(entropy_map, gradient_map, local_var, params);

% 4. 边缘保护
edge_map = detectEdges(z_pre);
edge_protection_map = generateEdgeProtectionMap(edge_map, params.edge_protection);

% 5. 多尺度BM3D
y_bm3d = BM3D_MultiScale(z, sigma, params, tau_adaptive);

% 6. 细节增强
y_enhanced = enhanceDetails(y_bm3d, z, edge_protection_map, params.detail_boost);

% 7. 最终边缘保护
y_est = finalEnhancement(y_enhanced, z, edge_protection_map);

end

function z_pre = fastPreDenoise(z, sigma)
% 快速预去噪，用于获得更好的特征估计
if isnumeric(sigma) && numel(sigma) == 1
    filter_sigma = min(2.0, sigma/30);
    z_pre = imgaussfilt(z, filter_sigma);
    if sigma > 30
        try
            z_pre = imbilatfilt(z, 0.05, 2.0);
        catch
            z_pre = imgaussfilt(z, filter_sigma);
        end
    end
else
    z_pre = imgaussfilt(z, 1.0);
end
end

function [entropy_map, gradient_map] = calculateLocalFeatures(img, win_size)
% 计算局部熵和梯度幅值
if nargin < 2, win_size = 7; end
pad = floor(win_size/2);
img_pad = padarray(img, [pad pad], 'symmetric');
entropy_map = zeros(size(img));
gradient_map = zeros(size(img));
for i = 1:size(img,1)
    for j = 1:size(img,2)
        patch = img_pad(i:i+win_size-1, j:j+win_size-1);
        % 局部熵
        patch_hist = histcounts(patch(:), 16, 'Normalization', 'probability');
        patch_hist = patch_hist + eps;
        entropy_map(i,j) = -sum(patch_hist .* log2(patch_hist));
        % 局部梯度
        [Gx, Gy] = gradient(double(patch));
        gradient_map(i,j) = mean(sqrt(Gx(:).^2 + Gy(:).^2));
    end
end
entropy_map = entropy_map / (max(entropy_map(:)) + eps);
gradient_map = gradient_map / (max(gradient_map(:)) + eps);
end

function tau_adaptive = computeAdaptiveThresholdMulti(entropy_map, gradient_map, var_map, params)
% 多特征自适应阈值
combined = params.alpha * entropy_map + params.beta * gradient_map + params.gamma * var_map;
tau_map = 1 - combined;
tau_map = 1 ./ (1 + exp(-8 * (tau_map - 0.5)));
min_tau = params.tau_base * 0.5;
max_tau = params.tau_base * 2.0;
tau_adaptive = min_tau + (max_tau - min_tau) * tau_map;
tau_adaptive = imgaussfilt(tau_adaptive, 1.5);
end

function edge_map = detectEdges(img)
% 检测图像中的边缘
try
    edge_map = edge(img, 'canny');
    se = strel('disk', 2);
    edge_map = imdilate(edge_map, se);
    edge_map = double(edge_map);
    edge_map = imgaussfilt(edge_map, 1.0);
catch
    [Gx, Gy] = gradient(img);
    edge_map = sqrt(Gx.^2 + Gy.^2);
    edge_map = edge_map / (max(edge_map(:)) + eps);
    edge_map = double(edge_map > 0.1);
    edge_map = imgaussfilt(edge_map, 1.0);
end
end

function protection_map = generateEdgeProtectionMap(edge_map, strength)
protection_map = edge_map * strength;
protection_map = min(1, max(0, protection_map));
end

function y_enhanced = enhanceDetails(y, z, edge_map, boost_factor)
details = z - y;
boost_map = 1 - edge_map;
weighted_details = details .* boost_map * boost_factor;
y_enhanced = y + weighted_details;
y_enhanced = min(1, max(0, y_enhanced));
end

function y_final = finalEnhancement(y, z, edge_map)
y_final = y .* (1 - edge_map) + z .* edge_map;
y_final = min(1, max(0, y_final));
end

function y_bm3d = BM3D_MultiScale(z, sigma, params, tau_adaptive)
try
    if exist('BM3D', 'file') == 2
        y1 = BM3D(z, sigma, 'refilter');
        z_small = imresize(z, 0.5, 'bilinear');
        y2 = BM3D(z_small, sigma*0.7, 'refilter');
        y2 = imresize(y2, size(z), 'bilinear');
        z_large = imresize(z, 2, 'bilinear');
        y3 = BM3D(z_large, sigma*1.2, 'refilter');
        y3 = imresize(y3, size(z), 'bilinear');
        y_bm3d = (y1 + y2 + y3) / 3;
        tau_norm = (tau_adaptive - min(tau_adaptive(:))) / (max(tau_adaptive(:)) - min(tau_adaptive(:)) + eps);
        y_bm3d = y_bm3d .* (1-tau_norm) + y1 .* tau_norm;
    else
        warning('BM3D函数未找到，使用简化去噪');
        y_bm3d = simpleBM3D(z, sigma, tau_adaptive);
    end
catch
    warning('BM3D多尺度调用失败，使用简化去噪');
    y_bm3d = simpleBM3D(z, sigma, tau_adaptive);
end
end

function y_denoised = simpleBM3D(noisy_img, sigma, adaptive_factor)
% 简化的BM3D实现（当BM3D工具箱不可用时使用）
[height, width] = size(noisy_img);
if ~(isnumeric(sigma) && numel(sigma) == 1)
    if isnumeric(sigma) && numel(sigma) > 1
        sigma = mean(sigma(:));
    else
        sigma = 0.1;
    end
end
F = fft2(noisy_img);
[u, v] = meshgrid(1:width, 1:height);
u = u - width/2 - 1;
v = v - height/2 - 1;
D = sqrt(u.^2 + v.^2);
noise_power = sigma^2;
signal_power = var(noisy_img(:)) - noise_power;
signal_power = max(signal_power, noise_power/10);
adaptive_factor_resized = imresize(adaptive_factor, [height, width]);
H = signal_power ./ (signal_power + noise_power ./ adaptive_factor_resized);
H = fftshift(H);
F_filtered = F .* H;
y_denoised = real(ifft2(F_filtered));
y_denoised = max(0, min(1, y_denoised));
end