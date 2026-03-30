import mongoose from 'mongoose';
import Workspace from '../models/workspaceModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function testWebhook() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-db');
    console.log('Connected to MongoDB');

    // Find a workspace to upgrade (or create one)
    let workspace = await Workspace.findOne();
    if (!workspace) {
      console.log('No workspace found. Please run the app and create a workspace first.');
      process.exit(1);
    }

    console.log(`Upgrading workspace: ${workspace.name} (${workspace._id})`);

    // Simulate the update logic from the webhook
    await Workspace.findByIdAndUpdate(workspace._id, {
      'subscription.plan': 'pro',
      'subscription.stripeCustomerId': 'cus_test_123',
      'subscription.stripeSubscriptionId': 'sub_test_123',
      'subscription.status': 'active',
    });

    const updatedWorkspace = await Workspace.findById(workspace._id);
    console.log('Updated Workspace:', JSON.stringify(updatedWorkspace?.subscription, null, 2));

    if (updatedWorkspace?.subscription?.plan === 'pro') {
      console.log('✅ Webhook simulation SUCCESS');
    } else {
      console.log('❌ Webhook simulation FAILED');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during webhook test:', error);
    process.exit(1);
  }
}

testWebhook();
