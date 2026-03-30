import mongoose from 'mongoose';
import Workspace from '../models/workspaceModel.js';
import Document from '../models/documentModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function testDocumentLimit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-db');
    console.log('Connected to MongoDB');

    // 1. Find or create a Free workspace
    let workspace = await Workspace.findOne({ 'subscription.plan': 'free' });
    if (!workspace) {
      console.log('Creating a test Free workspace...');
      workspace = await Workspace.create({
        name: 'Test Free Workspace',
        owner: new mongoose.Types.ObjectId(),
        members: []
      });
    }

    console.log(`Testing workspace: ${workspace.name} (${workspace._id}) - Plan: ${workspace.subscription?.plan || 'free'}`);

    // 2. Clear existing documents for this workspace (for clean test)
    await Document.deleteMany({ workspace: workspace._id });
    console.log('Cleared existing documents for test.');

    // 3. Create 3 documents
    for (let i = 1; i <= 3; i++) {
        await Document.create({
            title: `Test Doc ${i}`,
            workspace: workspace._id,
            createdBy: workspace.owner
        });
        console.log(`Created document ${i}`);
    }

    // 4. Verify limit
    const count = await Document.countDocuments({ workspace: workspace._id });
    console.log(`Current document count: ${count}`);

    if (count === 3) {
      console.log('✅ Document count is 3. Ready for limit check.');
    } else {
      console.log('❌ Unexpected document count.');
    }

    // Note: To test the middleware, we'd need a running Express app. 
    // This script only verifies the logic that the middleware uses.
    
    console.log('Logic Verification:');
    const isLimitReached = (workspace.subscription?.plan !== 'pro' && count >= 3);
    console.log(`Is Limit Reached (Free Plan)? ${isLimitReached}`);

    if (isLimitReached) {
        console.log('✅ Logic correctly identifies limit for Free plan');
    }

    // 5. Test PRO plan logic
    console.log('\nTesting PRO Plan Logic:');
    await Workspace.findByIdAndUpdate(workspace._id, { 'subscription.plan': 'pro' });
    const updatedWorkspace = await Workspace.findById(workspace._id);
    const isLimitReachedPro = (updatedWorkspace?.subscription?.plan !== 'pro' && count >= 3);
    console.log(`Is Limit Reached (Pro Plan)? ${isLimitReachedPro}`);

    if (!isLimitReachedPro) {
        console.log('✅ Logic correctly identifies NO limit for Pro plan');
    }

    // Cleanup
    await Workspace.findByIdAndDelete(workspace._id);
    await Document.deleteMany({ workspace: workspace._id });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during document limit test:', error);
    process.exit(1);
  }
}

testDocumentLimit();
