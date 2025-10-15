import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

import type { Order as OrderType } from "@/types";

interface Order3DVisualizationProps {
  orders: OrderType[];
}

const Order3DVisualization = ({ orders }: Order3DVisualizationProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    meshes: THREE.Mesh[];
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    setIsLoading(true);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / 400,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, 400);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid floor
    const gridHelper = new THREE.GridHelper(30, 30, 0xe5e7eb, 0xe5e7eb);
    scene.add(gridHelper);

    // Floor plane for shadows
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create order meshes
    const meshes: THREE.Mesh[] = [];
    const gridSize = Math.ceil(Math.sqrt(orders.length));
    const spacing = 4;

    orders.forEach((order, index) => {
      // Use dimensions from order
      const width = order.dimensions.length || 2;
      const height = order.dimensions.height || 2;
      const depth = order.dimensions.width || 2;

      const color = 
        order.priority === "HIGH" ? 0xff0000 :
        order.priority === "MEDIUM" ? 0xffaa00 : 0x00aa00;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhongMaterial({ 
        color,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Store order data in mesh
      (mesh as any).userData = {
        orderId: order.id,
        material: order.materialType,
        quantity: (order.quantity / 1000).toFixed(1),
        priority: order.priority
      };

      const angle = (index / orders.length) * Math.PI * 2;
      const radius = 8;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = 1;
      mesh.castShadow = true;

      scene.add(mesh);
      meshes.push(mesh);
    });

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.padding = "8px 12px";
    tooltip.style.background = "rgba(17, 24, 39, 0.95)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "0.5rem";
    tooltip.style.fontSize = "12px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.display = "none";
    tooltip.style.zIndex = "1000";
    document.body.appendChild(tooltip);

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      // Reset previous hover
      if (hoveredMesh && hoveredMesh !== intersects[0]?.object) {
        (hoveredMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        hoveredMesh = null;
        tooltip.style.display = "none";
      }

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        hoveredMesh = mesh;
        
        // Highlight
        (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x444444);

        // Show tooltip
        const data = (mesh as any).userData;
        tooltip.innerHTML = `
          <strong>${data.orderId}</strong><br/>
          Material: ${data.material}<br/>
          Quantity: ${data.quantity}t<br/>
          Priority: ${data.priority}
        `;
        tooltip.style.display = "block";
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.clientWidth;
        camera.aspect = width / 400;
        camera.updateProjectionMatrix();
        renderer.setSize(width, 400);
      }
    };
    window.addEventListener("resize", handleResize);

    sceneRef.current = { scene, camera, renderer, controls, meshes };
    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      document.body.removeChild(tooltip);
      controls.dispose();
      renderer.dispose();
      meshes.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      if (canvasRef.current && renderer.domElement.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, [orders, isVisible]);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Order Visualization</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} displayed
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide 3D
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View in 3D
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isVisible && (
          <>
            <div
              ref={canvasRef}
              className="w-full relative rounded-lg overflow-hidden border border-border"
              style={{ height: "400px" }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-sm text-muted-foreground">Loading 3D scene...</div>
                </div>
              )}
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
                <span className="text-muted-foreground">High/Critical Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }} />
                <span className="text-muted-foreground">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
                <span className="text-muted-foreground">Low Priority</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Order3DVisualization;
