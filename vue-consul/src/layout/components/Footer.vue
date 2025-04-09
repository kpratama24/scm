<template>
    <div class="footer">
      <div class="footer-content">
        <!-- Your footer content goes here -->
        <p>&copy; 2025 PT. Sisnet Mitra Sejahtera. All rights reserved.</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FooterComponent'
  }
  </script>
  
  <style lang="scss" scoped>
  .footer {
    background-color: #f0f2f5;
    padding: 15px;
    text-align: center;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    height: 50px; /* Fixed height for the footer */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .footer-content {
    width: 100%;
  }
  </style>