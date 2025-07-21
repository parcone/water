function [y_est, blocks] = adaptiveThresholdBM3D_v2(z, sigma_psd, profile, stage_arg, blockmatches)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%  基于局部图像熵与梯度信息的自适应阈值BM3D去噪算法 (改进版)
%  主要改进:
%  1. 更精确的特征计算和归一化
%  2. 可调节的自适应强度参数
%  3. 更好的阈值映射策略
%  4. 增强的边缘和纹理保护
%
%  y_est = adaptiveThresholdBM3D_v2(z, sigma_psd, profile)
%
%  输入参数:
%         'z' : 含噪图像(M x N 或 M x N x C 的 double 数组,像素值范围 [0,1])
%  'sigma_psd' : 噪声功率谱密度(M x N 的非负 double 数组) 或 噪声标准差
%   'profile' : 'np' --> 普通配置文件(默认) 'at' --> 自适应阈值配置文件 或结构体
%   'stage_arg' : 同BM3D,用于指定执行哪个阶段
%   'blockmatches' : 同BM3D
%  输出:
%      'y_est'  去噪图像  (M x N double 数组)
%      'blocks' 块匹配数据 (如果请求)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

addpath('bm3d');
if nargin < 2
    error('adaptiveThresholdBM3D_v2:输入参数不足，至少需要图像和噪声标准差两个参数');
end
if ~isnumeric(z) || ndims(z) > 3
    error('adaptiveThresholdBM3D_v2:第一个参数必须是图像矩阵');
end
[height, width, channels] = size(z);
if height < 8 || width < 8
    error('adaptiveThresholdBM3D_v2:图像尺寸太小，最小尺寸应为8x8');
end
if ~exist('profile','var') || isempty(profile)
    profile = 'np';
end
if isa(profile, 'string') || isa(profile, 'char')
    if strcmp(profile, 'at')
        profile = 'np';
    end
    profile_struct = [];
else
    profile_struct = profile;
    profile = 'np';
end
if ~exist('stage_arg','var') || isempty(stage_arg)
    stage_arg = [];
end
if ~exist('blockmatches','var')
    blockmatches = [];
end

% 自适应参数设置（优化参数以提升PSNR）
adaptive_params = struct();
adaptive_params.alpha = 0.35;        % 熵权重
adaptive_params.beta = 0.45;         % 梯度权重
adaptive_params.gamma = 0.7;         % 自适应强度 (0=不自适应, 1=完全自适应)
adaptive_params.min_factor = 0.25;   % 最小阈值因子
adaptive_params.max_factor = 1.6;    % 最大阈值因子

if channels == 1
    [y_est, blocks] = processChannel(z, sigma_psd, profile, stage_arg, adaptive_params, nargout > 1, blockmatches);
else
    y_est = zeros(size(z));
    blocks = [];
    for c = 1:channels
        if numel(sigma_psd) == 1
            channel_sigma = sigma_psd;
        elseif size(sigma_psd, 3) == channels
            channel_sigma = sigma_psd(:,:,c);
        else
            channel_sigma = sigma_psd;
        end
        if exist('blockmatches','var') && ~isempty(blockmatches) && c == 1
            [y_est(:,:,c), blocks] = processChannel(z(:,:,c), channel_sigma, profile, stage_arg, adaptive_params, true, blockmatches);
        else
            [y_est(:,:,c)] = processChannel(z(:,:,c), channel_sigma, profile, stage_arg, adaptive_params, false, []);
        end
    end
end
end

function [y_channel, blocks] = processChannel(z_channel, sigma_channel, profile, stage_arg, adaptive_params, return_blocks, blockmatches)
% 单通道图像的自适应BM3D处理

% 计算增强的局部特征
[entropy_map, gradient_map, combined_feature] = calculateEnhancedLocalFeatures(z_channel, adaptive_params);

% 创建自适应阈值因子映射
adaptive_factor = createAdaptiveThresholdMap(entropy_map, gradient_map, adaptive_params);

% 生成自适应PSD（或sigma）
PSD = sigma_channel ./ sqrt(adaptive_factor); % 以自适应因子调整噪声估计

% 调用BM3D的refilter阶段（核心调用）
try
    if exist('blockmatches','var') && ~isempty(blockmatches)
        if isempty(stage_arg)
            [y_bm3d, blocks] = BM3D(z_channel, PSD, 'refilter', blockmatches);
        else
            [y_bm3d, blocks] = BM3D(z_channel, PSD, 'refilter', stage_arg, blockmatches);
        end
    else
        if isempty(stage_arg)
            if nargout > 1
                [y_bm3d, blocks] = BM3D(z_channel, PSD, 'refilter');
            else
                y_bm3d = BM3D(z_channel, PSD, 'refilter');
                blocks = [];
            end
        else
            if nargout > 1
                [y_bm3d, blocks] = BM3D(z_channel, PSD, 'refilter', stage_arg);
            else
                y_bm3d = BM3D(z_channel, PSD, 'refilter', stage_arg);
                blocks = [];
            end
        end
    end
catch ME
    warning('BM3D调用出错: %s，使用简化去噪', ME.message);
    [y_bm3d, blocks] = simpleBM3D(z_channel, sigma_channel, adaptive_factor);
end

% 后处理：自适应融合，进一步提升PSNR
% 重要区域（小adaptive_factor）保留更多BM3D结果，平滑区域保留更多原始
weight = (1 - adaptive_params.gamma) + adaptive_params.gamma * (1 - adaptive_factor);
weight = weight / max(weight(:));
y_channel = weight .* y_bm3d + (1 - weight) .* z_channel;
% 限制输出范围
if isa(y_channel, 'double')
    y_channel = min(max(y_channel, 0), 1);
end
end

function [entropy_map, gradient_map, combined_feature] = calculateEnhancedLocalFeatures(img, params)
[height, width] = size(img);
window_size = 7;  half_win = floor(window_size / 2);
entropy_map = zeros(height, width);
gradient_map = zeros(height, width);
img_padded = padarray(img, [half_win, half_win], 'replicate');
[Gx, Gy] = gradient(img);
gradient_magnitude = sqrt(Gx.^2 + Gy.^2);
for i = 1:height
    for j = 1:width
        window = img_padded(i:i+2*half_win, j:j+2*half_win);
        entropy_map(i, j) = calculateLocalEntropy(window);
        gradient_window = gradient_magnitude(max(1,i-half_win):min(height,i+half_win), max(1,j-half_win):min(width,j+half_win));
        gradient_map(i, j) = mean(gradient_window(:));
    end
end
entropy_map = normalizeFeature(entropy_map);
gradient_map = normalizeFeature(gradient_map);
sigma_smooth = 1.0;
entropy_map = imgaussfilt(entropy_map, sigma_smooth);
gradient_map = imgaussfilt(gradient_map, sigma_smooth);
combined_feature = params.alpha * entropy_map + params.beta * gradient_map;
combined_feature = normalizeFeature(combined_feature);
end

function entropy_val = calculateLocalEntropy(window)
window_quantized = round(window * 255);
hist_counts = histcounts(window_quantized, 0:256);
hist_counts = hist_counts(hist_counts > 0);
prob = hist_counts / sum(hist_counts);
entropy_val = -sum(prob .* log2(prob + eps));
end

function normalized_feature = normalizeFeature(feature)
min_val = min(feature(:));
max_val = max(feature(:));
if max_val > min_val
    normalized_feature = (feature - min_val) / (max_val - min_val);
else
    normalized_feature = zeros(size(feature));
end
end

function adaptive_factor = createAdaptiveThresholdMap(entropy_map, gradient_map, params)
importance_map = params.alpha * entropy_map + params.beta * gradient_map;
sigmoid_map = 1 ./ (1 + exp(-10 * (importance_map - 0.5)));
adaptive_factor = 1 - sigmoid_map;
adaptive_factor = params.gamma * adaptive_factor + (1 - params.gamma) * 0.5;
adaptive_factor = adaptive_factor * (params.max_factor - params.min_factor) + params.min_factor;
adaptive_factor = max(params.min_factor, min(params.max_factor, adaptive_factor));
end

function [y_denoised, blocks] = simpleBM3D(noisy_img, sigma, adaptive_factor)
[height, width] = size(noisy_img);
blocks = [];
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