import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Text } from "@react-three/drei";
import { Card } from "@/components/ui/card";

interface Wagon3DViewerProps {
  wagonType?: string;
  capacity?: number;
  fillPercentage?: number;
  material?: string;
}

const WagonModel = ({ fillPercentage = 0, material = "Steel" }: { fillPercentage: number; material: string }) => {
  return (
    <group>
      {/* Wagon body */}
      <Box args={[4, 1.5, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#4A5568" />
      </Box>
      
      {/* Cargo fill */}
      {fillPercentage > 0 && (
        <Box args={[3.8, 1.3 * (fillPercentage / 100), 1.3]} position={[0, 0.65 * (fillPercentage / 100), 0]}>
          <meshStandardMaterial color="#3B82F6" opacity={0.7} transparent />
        </Box>
      )}
      
      {/* Wheels */}
      <Box args={[0.3, 0.3, 0.3]} position={[-1.5, 0, 0.8]}>
        <meshStandardMaterial color="#1A202C" />
      </Box>
      <Box args={[0.3, 0.3, 0.3]} position={[-1.5, 0, -0.8]}>
        <meshStandardMaterial color="#1A202C" />
      </Box>
      <Box args={[0.3, 0.3, 0.3]} position={[1.5, 0, 0.8]}>
        <meshStandardMaterial color="#1A202C" />
      </Box>
      <Box args={[0.3, 0.3, 0.3]} position={[1.5, 0, -0.8]}>
        <meshStandardMaterial color="#1A202C" />
      </Box>
      
      {/* Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#3B82F6"
        anchorX="center"
        anchorY="middle"
      >
        {material}
      </Text>
    </group>
  );
};

export const Wagon3DViewer = ({
  wagonType = "Standard",
  capacity = 0,
  fillPercentage = 0,
  material = "Steel"
}: Wagon3DViewerProps) => {
  return (
    <Card className="p-4 bg-gradient-surface">
      <div className="h-64 w-full">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <WagonModel fillPercentage={fillPercentage} material={material} />
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium">Type: {wagonType}</p>
        <p className="text-sm text-muted-foreground">Capacity: {capacity} tons</p>
        <p className="text-sm text-muted-foreground">Fill: {fillPercentage}%</p>
      </div>
    </Card>
  );
};
