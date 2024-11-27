<template>
  <div class="container mt-5">
    <form @submit.prevent="submitForm" class="border p-4 shadow-sm rounded">
      <h3 class="mb-4">Order Form</h3>

      <!-- Customer Name -->
      <div class="mb-3">
        <label for="customerName" class="form-label">Customer Name:</label>
        <input type="text" v-model="order.customerName" class="form-control" required />
      </div>

      <!-- Customer Email -->
      <div class="mb-3">
        <label for="customerEmail" class="form-label">Customer Email:</label>
        <input type="email" v-model="order.customerEmail" class="form-control" required />
      </div>

      <!-- Customer Phone -->
      <div class="mb-3">
        <label for="customerPhone" class="form-label">Customer Phone:</label>
        <input type="tel" v-model="order.customerPhone" class="form-control" required />
      </div>

      <!-- Product Section -->
      <div class="mb-3">
        <label for="products" class="form-label">Select Product:</label>
        <div v-for="(product, index) in order.products" :key="index" class="mb-4">
          <div class="row">
            <!-- Product Search Input (Full Width on Mobile) -->
            <div class="col-12 col-md-4 mb-2 mb-md-0">
              <input
                  type="text"
                  v-model="product.searchQuery"
                  @input="searchProduct(index)"
                  class="form-control"
                  placeholder="Search Product"
              />
            </div>
            <!-- Product Dropdown (Full Width on Mobile) -->
            <div class="col-12 col-md-4 mb-2 mb-md-0">
              <select v-model="product.id" class="form-select" required>
                <option value="" disabled selected>Select Product</option>
                <option v-for="p in product.searchResults" :value="p.id" :key="p.id">{{ p.name }}</option>
              </select>
            </div>
            <!-- Quantity Input (Full Width on Mobile) -->
            <div class="col-12 col-md-2 mb-2 mb-md-0">
              <input
                  type="number"
                  v-model="product.quantity"
                  min="1"
                  placeholder="Quantity"
                  class="form-control"
                  required
              />
            </div>
            <!-- Add More Button -->
            <div class="col-12 col-md-2">
              <button type="button" @click="addProduct" class="btn btn-outline-primary w-100">Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="d-flex justify-content-center">
        <button type="submit" :disabled="!formValid" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      order: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        products: [{ id: '', quantity: 1, searchQuery: '', searchResults: [] }]
      },
      formValid: true,
      typingTimeout: null
    };
  },
  methods: {
    // Debounced search API call
    async searchProduct(index) {
      const searchQuery = this.order.products[index].searchQuery;
      if (this.typingTimeout) clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(async () => {
        try {
          const response = await axios.get('/products', {
            params: {
              query: searchQuery
            }
          });
          this.order.products[index].searchResults = response.data.products;
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }, 300);
    },

    // Add a new product selection row
    addProduct() {
      this.order.products.push({ id: '', quantity: 1, searchQuery: '', searchResults: [] });
    },

    // Submit the form with order data
    async submitForm() {
      try {
        // Make the POST API call with order data
        const response = await axios.post('/api/order', this.order);
        console.log('Order Submitted:', response.data);
      } catch (error) {
        console.error('Error submitting order:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Add any additional custom styles here if necessary */
</style>
