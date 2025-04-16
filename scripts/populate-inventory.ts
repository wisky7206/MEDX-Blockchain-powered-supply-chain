import axios from 'axios';

async function populateInventory() {
  try {
    const response = await axios.post('http://localhost:3000/api/inventory/populate');
    console.log('Inventory populated successfully:', response.data);
  } catch (error) {
    console.error('Error populating inventory:', error);
  }
}

populateInventory(); 