<template>
  <div class="container mt-5">
    <form @submit.prevent="submitForm" class="border p-4 shadow-sm rounded">
      <h3 class="mb-4">Pre Order Form</h3>

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
        <input type="tel" v-model="order.customerPhone" class="form-control" :required="isPhoneRequired" />
      </div>

      <!-- Product Section -->
      <div class="mb-3">
        <label for="products" class="form-label">Select Product:</label>
        <div v-for="(product, index) in order.products" :key="index" class="mb-4">
          <div class="row">
            <!-- Product Search Input -->
            <div class="col-12 col-md-4 mb-2 mb-md-0">
              <input
                  type="text"
                  v-model="product.searchQuery"
                  @input="searchProduct(index)"
                  class="form-control"
                  placeholder="Search Product"
              />
            </div>
            <!-- Product Dropdown -->
            <div class="col-12 col-md-4 mb-2 mb-md-0">
              <select v-model="product.id" class="form-select" required>
                <option value="" disabled selected>Select Product</option>
                <option v-for="p in product.searchResults" :value="p.id" :key="p.id">{{ p.name }}</option>
              </select>
            </div>
            <!-- Quantity Input -->
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
// import { VueReCaptcha } from "vue-recaptcha-v3";
// Vue.use(VueReCaptcha, { siteKey: "6LfSJOoUAAAAACo5FptLy5inFhJmhIPF9E9ekwsN" });

export default {
  data() {
    return {
      order: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        products: [{ id: '', quantity: 1, searchQuery: '', searchResults: [] }]
      },
      typingTimeout: null
    };
  },
  computed: {
    formValid() {
      return (
          this.order.customerName &&
          this.order.customerEmail &&
          this.order.customerPhone &&
          this.order.products.every(
              (product) => product.id && product.quantity > 0
          )
      );
    },
    isPhoneRequired() {
      // Check if the email ends with @xyz.com
      return this.order.customerEmail.endsWith('@xyz.com');
    }
  },
  mounted() {
    this.fetchInitialProducts();
  },
  methods: {
    async fetchInitialProducts() {
      try {
        const response = await this.$axios.get('/products');
        this.order.products[0].searchResults = response.data.products;
      } catch (error) {
        console.error('Error fetching initial products:', error);
      }
    },
    async searchProduct(index) {
      const searchQuery = this.order.products[index].searchQuery;
      if (this.typingTimeout) clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(async () => {
        try {
          const response = await this.$axios.get('/products', { params: { query: searchQuery } });
          const results = response.data.products;
          this.order.products[index].searchResults = results;
          if (results.length === 0) {
            console.warn('No products found for the search query.');
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }, 300);
    },
    addProduct() {
      this.order.products.push({ id: '', quantity: 1, searchQuery: '', searchResults: [] });
    },
    async submitForm() {
      try {
        const response = await this.$axios.post('/pre-orders', this.order);
        console.log('Order Submitted:', response.data);
      } catch (error) {
        console.error('Error submitting order:', error);
      }
    }
  }
};
</script>

<style scoped>
input:invalid {
  border-color: red;
}
</style>
