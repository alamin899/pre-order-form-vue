<template>
  <div class="container mt-5">
    <form @submit.prevent="submitForm" class="border p-4 shadow-sm rounded">
      <h3 class="mb-4">Pre Order Form</h3>

      <input type="hidden" v-model="order.gRecaptchaToken" />

      <!-- Customer Name -->
      <div class="mb-3">
        <label for="customerName" class="form-label">Customer Name:</label>
        <input type="text" v-model="order.customer_name" class="form-control" required />
        <span v-if="errors.customer_name" class="text-danger">{{ errors.customer_name[0] }}</span>
      </div>

      <!-- Customer Email -->
      <div class="mb-3">
        <label for="customerEmail" class="form-label">Customer Email:</label>
        <input type="email" v-model="order.customer_email" class="form-control" required />
        <span v-if="errors.customer_email" class="text-danger">{{ errors.customer_email[0] }}</span>
      </div>

      <!-- Customer Phone -->
      <div class="mb-3">
        <label for="customerPhone" class="form-label">Customer Phone:</label>
        <input type="tel" v-model="order.customer_phone" class="form-control" :required="isPhoneRequired" />
        <span v-if="errors.customer_phone" class="text-danger">{{ errors.customer_phone[0] }}</span>
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
              <select v-model="product.slug" class="form-select" required>
                <option value="" disabled selected>Select Product</option>
                <option v-for="p in product.searchResults" :value="p.slug" :key="p.slug">{{ p.name }}</option>
              </select>
              <span v-if="errors[`products.${index}.slug`]" class="text-danger">{{ errors[`products.${index}.slug`][0] }}</span>
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
              <span v-if="errors[`products.${index}.quantity`]" class="text-danger">{{ errors[`products.${index}.quantity`][0] }}</span>
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
        <button type="submit"  class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { useReCaptcha } from 'vue-recaptcha-v3';
import { toast } from 'vue3-toastify';  // Import toast from vue3-toastify

export default {
  data() {
    return {
      order: {
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        gRecaptchaToken:'',
        products: [{ slug: '', quantity: 1, searchQuery: '', searchResults: [] }]
      },
      executeRecaptcha: null,
      typingTimeout: null,
      errors: {}, // Object to hold backend validation errors
    };
  },
  computed: {
    formValid() {
      return (
          this.order.customer_name &&
          this.order.customer_email &&
          this.order.customer_phone &&
          this.order.products.every(
              (product) => product.slug && product.quantity > 0
          ) &&
          this.isPhoneValid &&
          this.isEmailValid
      );
    },
    isPhoneValid() {
      return this.order.customer_phone.match(/^(\+\d{1,3}[- ]?)?\d{10}$/);
    },
    isEmailValid() {
      return this.order.customer_email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/);
    },
    isPhoneRequired() {
      return this.order.customer_email.endsWith('@xyz.com');
    }
  },
  mounted() {
    const {executeRecaptcha} = useReCaptcha();
    this.executeRecaptcha = executeRecaptcha;
    this.fetchInitialProducts();
  },
  methods: {
    async fetchInitialProducts() {
      try {
        const response = await this.$axios.get('/products');
        this.order.products[0].searchResults = response.data.data.products;
      } catch (error) {
        console.error('Error fetching initial products:', error);
      }
    },
    async searchProduct(index) {
      const searchQuery = this.order.products[index].searchQuery;
      if (this.typingTimeout) clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(async () => {
        try {
          const response = await this.$axios.get('/products', {params: {query: searchQuery}});
          const results = response.data.data.products;
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
      const newProduct = { slug: '', quantity: 1, searchQuery: '', searchResults: [] };
      this.order.products.push(newProduct);

      const newIndex = this.order.products.length - 1;
      this.fetchProductsForProductField(newIndex);
    },

    async fetchProductsForProductField(index) {
      try {
        const response = await this.$axios.get('/products');
        this.order.products[index].searchResults = response.data.data.products; // Populate the searchResults array
      } catch (error) {
        console.error(`Error fetching products for product field ${index}:`, error);
      }
    },

    async submitForm() {
      try {
        // Clear previous errors
        this.errors = {};

        if (!this.executeRecaptcha) {
          console.error('reCAPTCHA is not initialized');
          return;
        }

        // Get reCAPTCHA token
        this.order.gRecaptchaToken = await this.executeRecaptcha('submit_form');

        const orderData = {
          ...this.order,
          products: this.order.products.map((product) => ({
            slug: product.slug,
            quantity: product.quantity,
          })),
        };
        const response = await this.$axios.post('/pre-order', orderData);
        console.log('Order Submitted:', response.data);

        // Show success toast
        toast.success('Your order has been successfully submitted!', {
          position: 'top-right',
          autoClose: 5000,
        });
      } catch (error) {
        if (error.response && error.response.status === 422) {
          // Backend validation error, populate errors object
          this.errors = error.response.data.errors;
        } else {
          console.error('Error submitting order:', error);
        }

        // Show error toast
        toast.error('An error occurred while submitting your order.', {
          position: 'top-right',
          autoClose: 5000,
        });
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
