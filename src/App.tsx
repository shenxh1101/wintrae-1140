import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  LoginPage,
  ChildTasksPage,
  ChildShopPage,
  ChildGrowthPage,
  ChildFamilyPage,
  ParentTasksPage,
  ParentRewardsPage,
  ParentApprovePage,
  ParentSettingsPage,
  ChildDetailPage,
} from './pages';

function App() {
  return (
    <Router>
      <div className="font-sans antialiased">
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/child/tasks" element={<ChildTasksPage />} />
          <Route path="/child/shop" element={<ChildShopPage />} />
          <Route path="/child/growth" element={<ChildGrowthPage />} />
          <Route path="/child/family" element={<ChildFamilyPage />} />

          <Route path="/parent/tasks" element={<ParentTasksPage />} />
          <Route path="/parent/rewards" element={<ParentRewardsPage />} />
          <Route path="/parent/approve" element={<ParentApprovePage />} />
          <Route path="/parent/settings" element={<ParentSettingsPage />} />
          <Route path="/parent/child/:userId" element={<ChildDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
