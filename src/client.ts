import { Connection, Client } from '@temporalio/client';
import { orderManagementWorkflow } from './workflows';
import type { OrderDetails } from './workflows';

async function run() {
  const connection = await Connection.connect();
  
  const client = new Client({
    connection,
  });

  // Example order details
  const sampleOrder: OrderDetails = {
    orderId: `order_${Date.now()}`,
    userId: 'user123',
    items: [
      {
        productId: 'prod_1',
        quantity: 2,
        price: 29.99
      }
    ],
    totalAmount: 59.98,
    shippingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    paymentInfo: {
      method: 'credit_card'
    }
  };

  try {
    const result = await client.workflow.execute(orderManagementWorkflow, {
      taskQueue: 'order-management',
      workflowId: `order-${sampleOrder.orderId}`,
      args: [sampleOrder],
    });
    
    console.log('Workflow result:', result);
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
