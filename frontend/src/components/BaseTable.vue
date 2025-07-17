<template>
  <div class="base-table">
    <div class="table-header" v-if="showHeader">
      <div class="header-left">
        <slot name="header-left">
          <h3 v-if="title">{{ title }}</h3>
        </slot>
      </div>
      <div class="header-right">
        <slot name="header-right">
          <div class="search-box" v-if="showSearch">
            <el-input
              v-model="searchText"
              :placeholder="searchPlaceholder"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>
        </slot>
      </div>
    </div>

    <div class="table-toolbar" v-if="$slots.toolbar">
      <slot name="toolbar" />
    </div>

    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="filteredData"
      :height="height"
      :max-height="maxHeight"
      :border="border"
      :stripe="stripe"
      v-loading="loading"
      :element-loading-text="loadingText"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        align="center"
        fixed="left"
      />
      <el-table-column
        v-if="showIndex"
        type="index"
        width="60"
        label="序号"
        align="center"
      />
      <slot />
      <template #empty>
        <div class="empty-block">
          <el-empty :description="emptyText" />
        </div>
      </template>
    </el-table>

    <div class="table-footer" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'BaseTable',
  components: {
    Search
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: '搜索...'
    },
    searchKeys: {
      type: Array,
      default: () => ['name']
    },
    selection: {
      type: Boolean,
      default: false
    },
    showIndex: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
    },
    stripe: {
      type: Boolean,
      default: true
    },
    height: {
      type: [String, Number],
      default: ''
    },
    maxHeight: {
      type: [String, Number],
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    total: {
      type: Number,
      default: 0
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  emits: [
    'selection-change',
    'size-change',
    'current-change',
    'search'
  ],
  setup(props, { emit }) {
    const tableRef = ref(null)
    const searchText = ref('')
    const currentPage = ref(1)
    const pageSize = ref(props.pageSizes[0])

    const filteredData = computed(() => {
      if (!searchText.value) return props.data
      const searchValue = searchText.value.toLowerCase()
      return props.data.filter(item => {
        return props.searchKeys.some(key => {
          const value = item[key]
          if (value == null) return false
          return String(value).toLowerCase().includes(searchValue)
        })
      })
    })

    const handleSearch = () => {
      emit('search', searchText.value)
    }

    const handleSelectionChange = (selection) => {
      emit('selection-change', selection)
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      emit('size-change', val)
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      emit('current-change', val)
    }

    // 暴露方法给父组件
    const toggleSelection = (rows) => {
      if (rows) {
        rows.forEach(row => {
          tableRef.value?.toggleRowSelection(row)
        })
      } else {
        tableRef.value?.clearSelection()
      }
    }

    return {
      tableRef,
      searchText,
      currentPage,
      pageSize,
      filteredData,
      handleSearch,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      toggleSelection
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.base-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    .header-left {
      h3 {
        margin: 0;
        font-size: $heading-4-size;
        font-weight: 600;
        color: $text-primary;
      }
    }

    .header-right {
      .search-box {
        width: 250px;
      }
    }
  }

  .table-toolbar {
    margin-bottom: $spacing-md;
  }

  .empty-block {
    padding: $spacing-xl 0;
  }

  .table-footer {
    margin-top: $spacing-md;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    // 自定义表格样式
    .el-table__header {
      th {
        background-color: $background-light;
        color: $text-primary;
        font-weight: 600;
      }
    }

    .el-table__row {
      &:hover > td {
        background-color: rgba($primary-color, 0.1);
      }
    }
  }

  :deep(.el-pagination) {
    // 自定义分页样式
    .el-pagination__total {
      margin-right: $spacing-md;
    }

    .el-pagination__sizes {
      margin-right: $spacing-md;
    }
  }
}
</style> 