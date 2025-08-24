import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PoundSterling, 
  Plus, 
  Car, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="flex-1 p-6" data-testid="training-page">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">VA Training Guide</h2>
        <p className="text-slate-600 mt-1">Learn how to find cars, price them accurately, and add them to the platform</p>
      </div>

      <div className="space-y-6">
        {/* Finding Cars Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Finding Cars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-slate-900">Best Sources for Car Leads</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Facebook Marketplace</h4>
                  <p className="text-sm text-slate-600 mb-3">Primary source for private sellers with competitive prices</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Large selection
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Direct seller contact
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Auto-fill supported
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">AutoTrader</h4>
                  <p className="text-sm text-slate-600 mb-3">Professional dealers and verified listings</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Verified listings
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Detailed specs
                    </div>
                    <div className="flex items-center text-sm">
                      <Info className="w-4 h-4 text-blue-500 mr-2" />
                      Higher prices
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Cars.co.uk</h4>
                  <p className="text-sm text-slate-600 mb-3">Mix of dealers and private sellers</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Good variety
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Decent pricing
                    </div>
                    <div className="flex items-center text-sm">
                      <Info className="w-4 h-4 text-blue-500 mr-2" />
                      Manual entry
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-900 mb-2">Pro Tips for Finding Good Leads</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Look for cars priced 10-20% below market value</li>
                  <li>• Focus on popular makes: BMW, Mercedes, Audi, Ford, Vauxhall</li>
                  <li>• Target cars 3-10 years old with reasonable mileage</li>
                  <li>• Check for clear photos and detailed descriptions</li>
                  <li>• Avoid cars with accident history or major issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cars Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PoundSterling className="w-5 h-5 mr-2" />
              Pricing Cars Accurately
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Asking Price Analysis</h3>
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h4 className="font-medium text-slate-900 mb-2">Research Methods</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Check similar cars on AutoTrader</li>
                      <li>• Compare with Cazoo and CarMax prices</li>
                      <li>• Use Parkers or CAP HPI valuations</li>
                      <li>• Factor in mileage and condition</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Price Adjustment Factors</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• High mileage: -10% to -20%</li>
                          <li>• Service history missing: -5% to -15%</li>
                          <li>• Minor cosmetic issues: -3% to -8%</li>
                          <li>• Urgent sale: -5% to -15%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Estimated Sale Price</h3>
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <h4 className="font-medium text-slate-900 mb-2">Profit Calculation</h4>
                    <div className="text-sm text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Asking Price:</span>
                        <span>£15,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Our Purchase Price:</span>
                        <span>£13,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Sale Price:</span>
                        <span className="font-medium">£16,500</span>
                      </div>
                      <hr className="border-slate-300" />
                      <div className="flex justify-between font-medium text-green-600">
                        <span>Potential Profit:</span>
                        <span>£3,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-medium text-green-900 mb-2">Target Profit Margins</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Cars under £10k: 15-25% margin</li>
                      <li>• Cars £10k-£20k: 10-20% margin</li>
                      <li>• Cars £20k-£30k: 8-15% margin</li>
                      <li>• Cars over £30k: 5-12% margin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adding to Platform Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Adding Cars to the Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Step-by-Step Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">1</Badge>
                    <div>
                      <h4 className="font-medium text-slate-900">Copy the source URL</h4>
                      <p className="text-sm text-slate-600">Copy the Facebook Marketplace, AutoTrader, or Cars.co.uk listing URL</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">2</Badge>
                    <div>
                      <h4 className="font-medium text-slate-900">Click "Add Lead"</h4>
                      <p className="text-sm text-slate-600">Navigate to the Leads page and click the "Add Lead" button</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">3</Badge>
                    <div>
                      <h4 className="font-medium text-slate-900">Paste the URL</h4>
                      <p className="text-sm text-slate-600">Paste the URL in the Source URL field - details will auto-populate for Facebook links</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">4</Badge>
                    <div>
                      <h4 className="font-medium text-slate-900">Fill remaining details</h4>
                      <p className="text-sm text-slate-600">Complete make, model, year, mileage, and pricing information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">5</Badge>
                    <div>
                      <h4 className="font-medium text-slate-900">Submit the lead</h4>
                      <p className="text-sm text-slate-600">Click "Create Lead" to add it to the system for review</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Quality Guidelines</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Good Leads Include
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Complete and accurate information</li>
                      <li>• Realistic pricing expectations</li>
                      <li>• Cars in reasonable condition</li>
                      <li>• Clear photos in the listing</li>
                      <li>• Responsive sellers</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Avoid These Leads
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Cars with major damage or issues</li>
                      <li>• Unrealistic or inflated pricing</li>
                      <li>• Incomplete or missing information</li>
                      <li>• Very old cars (usually 15+ years)</li>
                      <li>• Modified or customized vehicles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">Success Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Lead Quality:</strong> Aim for 80%+ approval rate on submitted leads
                </div>
                <div>
                  <strong>Profit Accuracy:</strong> Estimated vs actual profit within 15%
                </div>
                <div>
                  <strong>Response Time:</strong> Add leads within 24 hours of finding them
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Quick Reference Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <Search className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Find</h4>
                <p className="text-sm text-slate-600">Search Facebook, AutoTrader, Cars.co.uk</p>
              </div>
              
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <PoundSterling className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Price</h4>
                <p className="text-sm text-slate-600">Research market value and calculate profit</p>
              </div>
              
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <Plus className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Add</h4>
                <p className="text-sm text-slate-600">Submit lead with complete information</p>
              </div>
              
              <div className="text-center p-4 border border-slate-200 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-medium text-slate-900 mb-1">Track</h4>
                <p className="text-sm text-slate-600">Monitor progress and commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}