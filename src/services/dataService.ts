import mockDataJson from '../data/mockData.json';
import type { 
  MockData, 
  Order, 
  CMO, 
  Wagon, 
  Rake, 
  Siding, 
  LiveTracking, 
  Shift, 
  AIInsight,
  RakeData3D,
  Wagon3D,
  Order3D
} from '../types';

// Type assertion for imported JSON
const mockData = mockDataJson as MockData;

/**
 * Data Service - Centralized data access layer
 * This service provides a single source of truth for all mock data
 */
class DataService {
  // Orders
  getAllOrders(): Order[] {
    return mockData.orders;
  }

  getOrderById(id: string): Order | undefined {
    return mockData.orders.find(order => order.id === id);
  }

  getOrdersByStatus(status: string): Order[] {
    return mockData.orders.filter(order => order.status === status);
  }

  getOrdersByPriority(priority: string): Order[] {
    return mockData.orders.filter(order => order.priority === priority);
  }

  getOrdersByWagon(wagonId: string): Order[] {
    return mockData.orders.filter(order => order.assignedWagon === wagonId);
  }

  getOrdersByRake(rakeId: string): Order[] {
    return mockData.orders.filter(order => order.assignedRake === rakeId);
  }

  // CMOs
  getAllCMOs(): CMO[] {
    return mockData.cmos;
  }

  getCMOById(id: string): CMO | undefined {
    return mockData.cmos.find(cmo => cmo.id === id);
  }

  getCMOsByStatus(status: string): CMO[] {
    return mockData.cmos.filter(cmo => cmo.status === status);
  }

  getCMOsByMaterial(material: string): CMO[] {
    return mockData.cmos.filter(cmo => cmo.materials.includes(material));
  }

  // Wagons
  getAllWagons(): Wagon[] {
    return mockData.wagons;
  }

  getWagonById(id: string): Wagon | undefined {
    return mockData.wagons.find(wagon => wagon.id === id);
  }

  getAvailableWagons(): Wagon[] {
    return mockData.wagons.filter(wagon => wagon.available);
  }

  getWagonsByRake(rakeId: string): Wagon[] {
    return mockData.wagons.filter(wagon => wagon.assignedRake === rakeId);
  }

  getWagonsByType(type: string): Wagon[] {
    return mockData.wagons.filter(wagon => wagon.type === type);
  }

  // Rakes
  getAllRakes(): Rake[] {
    return mockData.rakes;
  }

  getRakeById(id: string): Rake | undefined {
    return mockData.rakes.find(rake => rake.id === id);
  }

  getRakesByStatus(status: string): Rake[] {
    return mockData.rakes.filter(rake => rake.status === status);
  }

  // Convert Rake to 3D Visualization format
  getRakeData3D(rakeId: string): RakeData3D | null {
    const rake = this.getRakeById(rakeId);
    if (!rake) return null;

    const wagons3D: Wagon3D[] = rake.wagons.map((wagonId, idx) => {
      const wagon = this.getWagonById(wagonId);
      const orders = this.getOrdersByWagon(wagonId);

      const orders3D: Order3D[] = orders.map(order => ({
        id: order.id,
        qty: order.quantity,
        dest: order.destination.location,
        priority: order.priority,
        dimensions: order.dimensions,
        shape: order.shape,
      }));

      return {
        wagonId: wagonId,
        capacity: wagon?.capacity || 60000,
        currentLoad: wagon?.currentLoad || 0,
        color: this.hexToNumber(wagon?.color || '#3b82f6'),
        orders: orders3D,
      };
    });

    return {
      rakeId: rake.id,
      wagons: wagons3D,
    };
  }

  // Sidings
  getAllSidings(): Siding[] {
    return mockData.sidings;
  }

  getSidingById(id: string): Siding | undefined {
    return mockData.sidings.find(siding => siding.id === id);
  }

  getAvailableSidings(): Siding[] {
    return mockData.sidings.filter(siding => siding.availableSlots > 0);
  }

  // Live Tracking
  getAllLiveTracking(): LiveTracking[] {
    return mockData.liveTracking;
  }

  getLiveTrackingById(id: string): LiveTracking | undefined {
    return mockData.liveTracking.find(tracking => tracking.id === id);
  }

  getLiveTrackingByType(type: string): LiveTracking[] {
    return mockData.liveTracking.filter(tracking => tracking.type === type);
  }

  // Shifts
  getAllShifts(): Shift[] {
    return mockData.shifts;
  }

  getShiftById(id: string): Shift | undefined {
    return mockData.shifts.find(shift => shift.id === id);
  }

  getActiveShifts(): Shift[] {
    return mockData.shifts.filter(shift => shift.status === 'Active');
  }

  // AI Insights
  getAllInsights(): AIInsight[] {
    return mockData.aiInsights;
  }

  getInsightById(id: string): AIInsight | undefined {
    return mockData.aiInsights.find(insight => insight.id === id);
  }

  getInsightsByType(type: string): AIInsight[] {
    return mockData.aiInsights.filter(insight => insight.type === type);
  }

  getInsightsBySeverity(severity: string): AIInsight[] {
    return mockData.aiInsights.filter(insight => insight.severity === severity);
  }

  // Utility functions
  private hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  // Statistics
  getTotalOrders(): number {
    return mockData.orders.length;
  }

  getTotalActiveOrders(): number {
    return mockData.orders.filter(order => order.status === 'Active').length;
  }

  getTotalWagons(): number {
    return mockData.wagons.length;
  }

  getTotalAvailableWagons(): number {
    return mockData.wagons.filter(wagon => wagon.available).length;
  }

  getAverageWagonUtilization(): number {
    const wagons = mockData.wagons;
    if (wagons.length === 0) return 0;
    const totalUtilization = wagons.reduce((sum, wagon) => sum + wagon.utilizationPercent, 0);
    return totalUtilization / wagons.length;
  }

  getTotalCost(): number {
    return mockData.rakes.reduce((sum, rake) => sum + rake.cost, 0);
  }

  getAverageSLACompliance(): number {
    const rakes = mockData.rakes;
    if (rakes.length === 0) return 0;
    const totalSLA = rakes.reduce((sum, rake) => sum + rake.slaCompliance, 0);
    return totalSLA / rakes.length;
  }

  // Metadata
  getMetadata() {
    return mockData.metadata;
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export class for testing
export default DataService;
