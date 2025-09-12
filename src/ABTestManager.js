import React, { useState, useEffect } from 'react';
import { 
  TestTube, Plus, Play, Pause, BarChart3, Users, 
  TrendingUp, Eye, Edit, Trash2, Copy, Settings,
  CheckCircle, XCircle, AlertCircle, Calendar,
  Target, Zap, Award, RefreshCw, Download, X
} from 'lucide-react';

const ABTestManager = () => {
  const [activeTests, setActiveTests] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeTab, setActiveTab] = useState('tests');

  // API base URL - use relative path for Vercel deployment
  const API_URL = process.env.NODE_ENV === 'production' 
    ? '' 
    : '';

  useEffect(() => {
    fetchTests();
    fetchTestResults();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ab-tests`);
      if (response.ok) {
        const data = await response.json();
        setActiveTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    }
  };

  const fetchTestResults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ab-tests/results`);
      if (response.ok) {
        const data = await response.json();
        setTestResults(data.results || {});
      }
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    }
  };

  // Test Templates
  const testTemplates = [
    {
      name: 'Headline Split Test',
      type: 'headline',
      description: 'Test different main headlines to see what resonates best',
      variants: [
        { name: 'Control', content: 'Earn $500-$1000 Monthly Passive Income' },
        { name: 'Variant A', content: 'Start Earning Passive Income This Month' },
        { name: 'Variant B', content: 'Get Paid $750/Month for Doing Nothing' }
      ]
    },
    {
      name: 'CTA Button Test',
      type: 'cta',
      description: 'Test different call-to-action button text and colors',
      variants: [
        { name: 'Control', content: 'Apply Now', style: 'bg-purple-600' },
        { name: 'Variant A', content: 'Get Started Today', style: 'bg-green-600' },
        { name: 'Variant B', content: 'Start Earning Now', style: 'bg-blue-600' }
      ]
    },
    {
      name: 'Value Proposition Test',
      type: 'value-prop',
      description: 'Test different ways of presenting the core value',
      variants: [
        { name: 'Control', content: 'Earn passive income by hosting our equipment at your residence' },
        { name: 'Variant A', content: 'Get paid monthly for sharing your internet and space' },
        { name: 'Variant B', content: 'Turn your home into a revenue-generating asset' }
      ]
    },
    {
      name: 'Social Proof Test',
      type: 'social-proof',
      description: 'Test different social proof elements',
      variants: [
        { name: 'Control', content: 'Join 500+ successful members' },
        { name: 'Variant A', content: 'Trusted by families in all 50 states' },
        { name: 'Variant B', content: '98% of members earn within first month' }
      ]
    }
  ];

  const CreateTestModal = () => {
    const [testData, setTestData] = useState({
      name: '',
      description: '',
      type: 'headline',
      trafficSplit: 50,
      variants: [
        { name: 'Control', content: '', isControl: true },
        { name: 'Variant A', content: '', isControl: false }
      ]
    });
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleTemplateSelect = (template) => {
      setSelectedTemplate(template);
      setTestData({
        ...testData,
        name: template.name,
        description: template.description,
        type: template.type,
        variants: template.variants.map((v, index) => ({
          ...v,
          isControl: index === 0
        }))
      });
    };

    const addVariant = () => {
      setTestData({
        ...testData,
        variants: [
          ...testData.variants,
          { 
            name: `Variant ${String.fromCharCode(65 + testData.variants.length - 1)}`, 
            content: '', 
            isControl: false 
          }
        ]
      });
    };

    const updateVariant = (index, field, value) => {
      const newVariants = [...testData.variants];
      newVariants[index][field] = value;
      setTestData({ ...testData, variants: newVariants });
    };

    const createTest = async () => {
      try {
        const response = await fetch(`${API_URL}/api/ab-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...testData,
            status: 'draft',
            createdAt: new Date()
          })
        });

        if (response.ok) {
          fetchTests();
          setShowCreateModal(false);
          setTestData({
            name: '',
            description: '',
            type: 'headline',
            trafficSplit: 50,
            variants: [
              { name: 'Control', content: '', isControl: true },
              { name: 'Variant A', content: '', isControl: false }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to create test:', error);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create A/B Test</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Templates */}
            {!selectedTemplate && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setSelectedTemplate({})}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Or create custom test
                  </button>
                </div>
              </div>
            )}

            {selectedTemplate && (
              <>
                {/* Test Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
                    <input
                      type="text"
                      value={testData.name}
                      onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Homepage Headline Test"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Traffic Split %</label>
                    <input
                      type="number"
                      value={testData.trafficSplit}
                      onChange={(e) => setTestData({ ...testData, trafficSplit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                      min="10"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={testData.description}
                    onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    rows="2"
                    placeholder="What are you testing and why?"
                  />
                </div>

                {/* Variants */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Test Variants</h3>
                    <button
                      onClick={addVariant}
                      className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-4">
                    {testData.variants.map((variant, index) => (
                      <div key={index} className={`p-4 border rounded-lg ${variant.isControl ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              className="font-medium bg-transparent border-none outline-none"
                            />
                            {variant.isControl && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">Control</span>
                            )}
                          </div>
                        </div>
                        <textarea
                          value={variant.content}
                          onChange={(e) => updateVariant(index, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                          rows="2"
                          placeholder="Enter variant content..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={createTest}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Test
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TestCard = ({ test }) => {
    const results = testResults[test.id] || {};
    const totalViews = results.totalViews || 0;
    const conversions = results.conversions || {};
    
    const calculateConversionRate = (variant) => {
      const views = results.variantViews?.[variant] || 0;
      const convs = conversions[variant] || 0;
      return views > 0 ? ((convs / views) * 100).toFixed(2) : 0;
    };

    const getBestPerformer = () => {
      let best = { variant: 'Control', rate: 0 };
      test.variants.forEach(variant => {
        const rate = parseFloat(calculateConversionRate(variant.name));
        if (rate > best.rate) {
          best = { variant: variant.name, rate };
        }
      });
      return best;
    };

    const toggleTest = async (testId, newStatus) => {
      try {
        const response = await fetch(`${API_URL}/api/ab-tests/${testId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          fetchTests();
        }
      } catch (error) {
        console.error('Failed to update test status:', error);
      }
    };

    const bestPerformer = getBestPerformer();

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
            <p className="text-gray-600 text-sm">{test.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              test.status === 'active' ? 'bg-green-100 text-green-800' :
              test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {test.status}
            </span>
            <button
              onClick={() => toggleTest(test.id, test.status === 'active' ? 'paused' : 'active')}
              className={`p-2 rounded-lg ${
                test.status === 'active' 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {test.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Test Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{bestPerformer.variant}</p>
            <p className="text-sm text-gray-600">Best Performer</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{bestPerformer.rate}%</p>
            <p className="text-sm text-gray-600">Best Rate</p>
          </div>
        </div>

        {/* Variants Performance */}
        <div className="space-y-3">
          {test.variants.map((variant, index) => {
            const conversionRate = calculateConversionRate(variant.name);
            const views = results.variantViews?.[variant.name] || 0;
            const convs = conversions[variant.name] || 0;
            const isWinner = variant.name === bestPerformer.variant && bestPerformer.rate > 0;

            return (
              <div key={index} className={`p-3 border rounded-lg ${isWinner ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{variant.name}</h4>
                    {variant.isControl && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">Control</span>
                    )}
                    {isWinner && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{conversionRate}%</div>
                    <div className="text-xs text-gray-600">{convs}/{views}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{variant.content}</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((parseFloat(conversionRate) / (bestPerformer.rate || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Created {new Date(test.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Testing Dashboard</h1>
          <p className="text-gray-600">Optimize conversion rates through systematic testing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchTests}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['tests', 'results', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-purple-500 text-purple-600 font-medium' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'tests' && (
        <div>
          {activeTests.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B tests yet</h3>
              <p className="text-gray-600 mb-6">Create your first test to start optimizing conversions</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Create Your First Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Test Results Summary</h3>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4" />
            <p>Detailed results and analytics coming soon</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Testing Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Statistical Significance</h4>
                <p className="text-sm text-gray-600">Minimum confidence level for declaring winners</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg">
                <option>95%</option>
                <option>99%</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Auto-Stop Tests</h4>
                <p className="text-sm text-gray-600">Automatically stop tests when significance is reached</p>
              </div>
              <input type="checkbox" className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      <CreateTestModal />
    </div>
  );
};

export default ABTestManager;