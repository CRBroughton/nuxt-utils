<script setup>
import { ref, watch, onMounted } from 'vue'

// Define default filter state
const defaultFilterState = {
  search: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  inStock: true,
  tags: [],
  currencies: [],
  colors: [],
  sizes: [],
  sort: 'relevance',
}

// Create reactive source of truth for our filter state
const filterState = ref({ ...defaultFilterState })

// Categories for select dropdown
const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'books', name: 'Books' },
  { id: 'home', name: 'Home & Kitchen' },
]

// Sorting options
const sortOptions = [
  { id: 'relevance', name: 'Relevance' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
  { id: 'newest', name: 'Newest First' },
]

// Available tags for multi-select
const availableTags = [
  { id: 'sale', name: 'On Sale' },
  { id: 'new', name: 'New Arrival' },
  { id: 'bestseller', name: 'Bestseller' },
  { id: 'limited', name: 'Limited Edition' },
]

// Mock data for filters
// Available currencies for multi-select dropdown (bracket notation)
const availableCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
]

// Available colors for multi-select (index notation)
const availableColors = [
  { id: 'red', name: 'Red' },
  { id: 'blue', name: 'Blue' },
  { id: 'green', name: 'Green' },
  { id: 'black', name: 'Black' },
  { id: 'white', name: 'White' },
]

// Available sizes for multi-select (repeat notation)
const availableSizes = [
  { id: 'xs', name: 'Extra Small' },
  { id: 's', name: 'Small' },
  { id: 'm', name: 'Medium' },
  { id: 'l', name: 'Large' },
  { id: 'xl', name: 'Extra Large' },
]

// Use our form query composable to sync with URL
const { urlParams, updateUrlParams, clearUrlParams, initialValuesFromUrl } = useFormQuery({
  values: filterState,
  onlyDirtyValues: true,
  urlOptions: {
    writeMode: 'replace',
  },
  // Only sync these fields with URL
  urlFields: ['search', 'category', 'minPrice', 'maxPrice', 'inStock', 'tags', 'currencies', 'colors', 'sizes', 'sort'],
  // Specify array formats for different fields
  arrayFormat: {
    default: 'comma', // Default to comma-separated
    fields: {
      // Use bracket notation for currencies (e.g., currencies[]=USD&currencies[]=EUR)
      currencies: 'bracket',
      // Keep tags as comma-separated (e.g., tags=sale,new)
      tags: 'comma',
      // Use index notation for colors (e.g., colors[0]=red&colors[1]=blue)
      colors: 'repeat',
      // Use repeat notation for sizes (e.g., sizes=s&sizes=m&sizes=l)
      sizes: 'repeat',
    },
  },
  // Add updateValues callback to receive changes from URL
  updateValues: (values) => {
    // Update our filter state with values from URL
    Object.assign(filterState.value, values)
  },
})

// Initialize state from URL on component mount
onMounted(() => {
  // Get initial values from URL
  const urlValues = initialValuesFromUrl()

  // Apply URL values to our filter state
  if (Object.keys(urlValues).length) {
    // Merge URL values with default values
    filterState.value = {
      ...defaultFilterState,
      ...urlValues,
    }
  }
})

// Mock function to simulate API request
const fetchResults = () => {
  console.log('Fetching with filters:', filterState.value)
  // In a real app, you would make an API call here
}

// Watch for changes to trigger data fetching
watch(filterState, fetchResults, { deep: true })

// Handle tag toggling
const toggleTag = (tagId) => {
  if (filterState.value.tags.includes(tagId)) {
    filterState.value.tags = filterState.value.tags.filter(t => t !== tagId)
  }
  else {
    filterState.value.tags = [...filterState.value.tags, tagId]
  }
}

// Toggle handler for colors
const toggleColor = (colorId) => {
  if (filterState.value.colors.includes(colorId)) {
    filterState.value.colors = filterState.value.colors.filter(c => c !== colorId)
  }
  else {
    filterState.value.colors = [...filterState.value.colors, colorId]
  }
}

// Toggle handler for sizes
const toggleSize = (sizeId) => {
  if (filterState.value.sizes.includes(sizeId)) {
    filterState.value.sizes = filterState.value.sizes.filter(s => s !== sizeId)
  }
  else {
    filterState.value.sizes = [...filterState.value.sizes, sizeId]
  }
}

// Reset all filters
const resetFilters = () => {
  filterState.value = {
    ...defaultFilterState,
  }

  // Also clear URL params
  clearUrlParams()
}
</script>

<template>
  <div class="filter-page">
    <h1>Product Filters with URL Sync</h1>

    <div class="filter-panel">
      <!-- Search input -->
      <div class="filter-group">
        <label for="search">Search</label>
        <input
          id="search"
          v-model="filterState.search"
          placeholder="Search products..."
          type="text"
        >
      </div>

      <!-- Category selector -->
      <div class="filter-group">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="filterState.category"
        >
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Price range -->
      <div class="filter-group price-range">
        <label>Price Range</label>
        <div class="price-inputs">
          <div>
            <input
              id="min-price"
              v-model.number="filterState.minPrice"
              type="number"
              min="0"
            >
            <label for="min-price">Min</label>
          </div>
          <div>
            <input
              id="max-price"
              v-model.number="filterState.maxPrice"
              type="number"
              min="0"
            >
            <label for="max-price">Max</label>
          </div>
        </div>
      </div>

      <!-- Stock filter -->
      <div class="filter-group checkbox">
        <input
          id="in-stock"
          v-model="filterState.inStock"
          type="checkbox"
        >
        <label for="in-stock">In Stock Only</label>
      </div>

      <!-- Tags multi-select (comma-separated style) -->
      <div class="filter-group">
        <label>Tags (comma-separated style)</label>
        <div class="tags-list">
          <button
            v-for="tag in availableTags"
            :key="tag.id"
            :class="{ active: filterState.tags.includes(tag.id) }"
            type="button"
            @click="toggleTag(tag.id)"
          >
            {{ tag.name }}
          </button>
        </div>
        <div class="url-example">
          <small>URL format: <code>tags=sale,new,bestseller</code></small>
        </div>
      </div>

      <!-- Currencies multi-select dropdown (BRACKET notation) -->
      <div class="filter-group">
        <label for="currencies">Currencies (bracket notation)</label>
        <select
          id="currencies"
          v-model="filterState.currencies"
          multiple
          class="multi-select"
        >
          <option
            v-for="currency in availableCurrencies"
            :key="currency.code"
            :value="currency.code"
          >
            {{ currency.name }}
          </option>
        </select>
        <div
          v-if="filterState.currencies.length > 0"
          class="selection-info"
        >
          Selected: {{ filterState.currencies.join(', ') }}
        </div>
        <div class="url-example">
          <small>URL format: <code>currencies[]=USD&currencies[]=EUR</code></small>
        </div>
      </div>

      <!-- Colors multi-select (INDEX notation) -->
      <div class="filter-group">
        <label>Colors (index notation)</label>
        <div class="colors-list">
          <div
            v-for="color in availableColors"
            :key="color.id"
            class="color-item"
          >
            <button
              :class="{ active: filterState.colors.includes(color.id) }"
              :style="{ backgroundColor: color.id === 'white' ? color.id : null }"
              type="button"
              @click="toggleColor(color.id)"
            >
              <span :style="{ color: color.id === 'white' ? 'black' : 'white' }">
                {{ color.name }}
              </span>
            </button>
          </div>
        </div>
        <div class="url-example">
          <small>URL format: <code>colors[0]=red&colors[1]=blue</code></small>
        </div>
      </div>

      <!-- Sizes multi-select (REPEAT notation) -->
      <div class="filter-group">
        <label>Sizes (repeat notation)</label>
        <div class="sizes-list">
          <button
            v-for="size in availableSizes"
            :key="size.id"
            :class="{ active: filterState.sizes.includes(size.id) }"
            type="button"
            @click="toggleSize(size.id)"
          >
            {{ size.name }}
          </button>
        </div>
        <div class="url-example">
          <small>URL format: <code>sizes=s&sizes=m</code></small>
        </div>
      </div>

      <!-- Sort options -->
      <div class="filter-group">
        <label for="sort">Sort By</label>
        <select
          id="sort"
          v-model="filterState.sort"
        >
          <option
            v-for="option in sortOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.name }}
          </option>
        </select>
      </div>

      <!-- Reset button -->
      <div class="filter-actions">
        <button
          type="button"
          class="reset-button"
          @click="resetFilters"
        >
          Reset All Filters
        </button>
      </div>
    </div>

    <div class="url-display">
      <h3>Generated URL Parameters:</h3>
      <div class="url-display-content">
        <div
          v-for="(value, key) in urlParams"
          :key="key"
          class="url-param"
        >
          <span class="param-key">{{ key }}</span>
          <span class="param-equals">=</span>
          <span class="param-value">{{ Array.isArray(value) ? JSON.stringify(value) : value }}</span>
        </div>
      </div>
    </div>

    <div class="array-type-demo">
      <h3>URL Array Format Types</h3>
      <p>This demo shows the four different ways to format arrays in URL parameters:</p>

      <div class="array-format-list">
        <div class="array-format">
          <h4>Comma-separated (tags)</h4>
          <code>tags=sale,new,bestseller</code>
          <p>Best for: Simple lists that won't contain commas</p>
        </div>

        <div class="array-format">
          <h4>Bracket Notation (currencies)</h4>
          <code>currencies[]=USD&currencies[]=EUR</code>
          <p>Best for: PHP, Rails, Laravel, Express.js backends</p>
        </div>

        <div class="array-format">
          <h4>Index Notation (colors)</h4>
          <code>colors[0]=red&colors[1]=blue</code>
          <p>Best for: Preserving array order, backends that need indices</p>
        </div>

        <div class="array-format">
          <h4>Repeat Notation (sizes)</h4>
          <code>sizes=s&sizes=m&sizes=l</code>
          <p>Best for: Some legacy APIs, certain Java frameworks</p>
        </div>
      </div>
    </div>

    <div class="state-display">
      <h3>Current Filter State:</h3>
      <pre>{{ JSON.stringify(filterState, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.filter-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 20px;
}

.filter-panel {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.multi-select {
  width: 100%;
  min-height: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.selection-info {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}

.price-inputs {
  display: flex;
  gap: 10px;
}

.price-inputs > div {
  flex: 1;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox label {
  margin: 0;
}

.tags-list, .sizes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tags-list button, .sizes-list button {
  background: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.tags-list button.active, .sizes-list button.active {
  background: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.colors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.color-item button {
  width: 80px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  background-color: #eee;
}

.color-item button.active {
  outline: 2px solid #2c3e50;
  font-weight: bold;
}

.color-item button[style*="white"] {
  background-color: white;
}

.color-item button:nth-child(1) { background-color: #e74c3c; }
.color-item button:nth-child(2) { background-color: #3498db; }
.color-item button:nth-child(3) { background-color: #2ecc71; }
.color-item button:nth-child(4) { background-color: #34495e; }

.currencies-list, .colors-list, .sizes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 5px;
}

.currency-option, .color-option, .size-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-example {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.url-example code {
  background: #e0e0e0;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
}

.filter-actions {
  margin-top: 20px;
  text-align: right;
}

.reset-button {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
}

.url-display, .state-display {
  margin-top: 20px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.url-display h3 {
  margin-bottom: 10px;
}

.url-display-content {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.4;
}

.url-param {
  margin-bottom: 4px;
}

.param-key {
  color: #0066cc;
  font-weight: bold;
}

.param-equals {
  margin: 0 5px;
  color: #666;
}

.param-value {
  color: #cc0000;
}

.array-type-demo {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
}

.array-format-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.array-format {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
}

.array-format h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.array-format code {
  display: block;
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  margin: 10px 0;
  font-family: monospace;
  white-space: nowrap;
  overflow-x: auto;
}

.array-format p {
  margin-bottom: 0;
  color: #666;
  font-size: 14px;
}

pre {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
