import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

// Type definitions
interface Dimensions {
  length: number;
  width: number;
  height: number;
}

interface Order {
  id: string;
  qty: number;
  dest: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dimensions: Dimensions;
  shape: 'box' | 'cylinder' | 'sphere';
}

interface Wagon {
  wagonId: string;
  capacity: number;
  currentLoad: number;
  color: number;
  orders: Order[];
}

interface RakeData {
  rakeId: string;
  wagons: Wagon[];
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

type OrderFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface RakeVisualizationProps {
  rakeData?: RakeData;
}

const RakeVisualization = ({ rakeData: propRakeData }: RakeVisualizationProps) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });
  const [selectedWagon, setSelectedWagon] = useState<Wagon | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('ALL');
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState<boolean>(true);
  
  // Three.js Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modalSceneRef = useRef<THREE.Scene | null>(null);
  const modalCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modalRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modalAnimationRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  type ObjectMapValue = 
    | { type: 'wagon'; data: Wagon }
    | { 
        type: 'order'; 
        data: Order; 
        wagon: { wagonId: string; wagonColor: number } 
      };

  const objectMapRef = useRef<Map<string, ObjectMapValue>>(new Map());
  const modalObjectMapRef = useRef<Map<string, ObjectMapValue>>(new Map());

  // Sample Data (fallback if no prop data provided)
  const defaultRakeData: RakeData = {
    rakeId: "R123-Express",
    wagons: [
      {
        wagonId: "W01",
        capacity: 60000,
        currentLoad: 53000,
        color: 0x3b82f6,
        orders: [
          { id: "ORD-2401", qty: 20000, dest: "Mumbai", priority: "HIGH", dimensions: { length: 8, width: 4, height: 3 }, shape: "box" },
          { id: "ORD-2402", qty: 15000, dest: "Delhi", priority: "MEDIUM", dimensions: { length: 6, width: 4, height: 3 }, shape: "box" },
          { id: "ORD-2403", qty: 18000, dest: "Bangalore", priority: "HIGH", dimensions: { length: 7, width: 4, height: 2.5 }, shape: "cylinder" }
        ]
      },
      {
        wagonId: "W02",
        capacity: 60000,
        currentLoad: 47000,
        color: 0x8b5cf6,
        orders: [
          { id: "ORD-2404", qty: 25000, dest: "Chennai", priority: "LOW", dimensions: { length: 10, width: 4, height: 3 }, shape: "box" },
          { id: "ORD-2405", qty: 22000, dest: "Kolkata", priority: "MEDIUM", dimensions: { length: 8, width: 4, height: 3.5 }, shape: "sphere" }
        ]
      },
      {
        wagonId: "W03",
        capacity: 60000,
        currentLoad: 50000,
        color: 0x06b6d4,
        orders: [
          { id: "ORD-2406", qty: 30000, dest: "Hyderabad", priority: "HIGH", dimensions: { length: 11, width: 4, height: 3 }, shape: "box" },
          { id: "ORD-2407", qty: 12000, dest: "Pune", priority: "LOW", dimensions: { length: 5, width: 3, height: 2 }, shape: "box" },
          { id: "ORD-2408", qty: 8000, dest: "Ahmedabad", priority: "MEDIUM", dimensions: { length: 4, width: 3, height: 2.5 }, shape: "box" }
        ]
      },
      {
        wagonId: "W04",
        capacity: 60000,
        currentLoad: 55000,
        color: 0xf59e0b,
        orders: [
          { id: "ORD-2409", qty: 35000, dest: "Jaipur", priority: "HIGH", dimensions: { length: 12, width: 4, height: 3.5 }, shape: "box" }
        ]
      }
    ]
  };

  // Use prop data if provided, otherwise use default
  const rakeData = propRakeData || defaultRakeData;

  // Utility Functions
  const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW' | string): number => {
    switch(priority) {
      case 'HIGH': return 0xff4444; // Brighter red
      case 'MEDIUM': return 0xffaa00; // Brighter yellow/orange
      case 'LOW': return 0x00cc66; // Brighter green
      default: return 0x888888; // Brighter gray
    }
  };

  const createOrderGeometry = (order: Order): THREE.BufferGeometry => {
    const { length, width, height } = order.dimensions;
    
    switch(order.shape) {
      case 'cylinder':
        return new THREE.CylinderGeometry(width / 2, width / 2, height, 8);
      case 'sphere':
        return new THREE.SphereGeometry(Math.max(width, height) / 2, 8, 6);
      case 'box':
      default:
        return new THREE.BoxGeometry(length, height, width);
    }
  };

  const createWagonWithOrders = (wagon: Wagon, isModal = false): THREE.Group => {
    const wagonGroup = new THREE.Group();
    const wagonLength = 30;
    const wagonHeight = 8;
    const wagonWidth = 10;

    // Translucent wagon body
    const wagonGeo = new THREE.BoxGeometry(wagonLength, wagonHeight, wagonWidth);
    const wagonMat = new THREE.MeshBasicMaterial({ 
      color: wagon.color,
      transparent: true,
      opacity: isModal ? 0.25 : 0.2,
      side: THREE.DoubleSide
    });
    const wagonMesh = new THREE.Mesh(wagonGeo, wagonMat);
    wagonMesh.position.y = wagonHeight / 2;
    
    const mapRef = isModal ? modalObjectMapRef : objectMapRef;
    mapRef.current.set(wagonMesh.uuid, {
      type: 'wagon',
      data: wagon
    });
    
    wagonGroup.add(wagonMesh);

    // Wagon frame (simplified - only corners)
    const edgeMat = new THREE.LineBasicMaterial({ 
      color: wagon.color,
      transparent: true,
      opacity: 0.8
    });
    const points = [
      new THREE.Vector3(-wagonLength/2, 0, -wagonWidth/2),
      new THREE.Vector3(wagonLength/2, 0, -wagonWidth/2),
      new THREE.Vector3(wagonLength/2, wagonHeight, -wagonWidth/2),
      new THREE.Vector3(-wagonLength/2, wagonHeight, -wagonWidth/2),
      new THREE.Vector3(-wagonLength/2, 0, -wagonWidth/2),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeo, edgeMat);
    wagonGroup.add(line);

    if (!isModal) {
      // Capacity indicator bar
      const utilizationRatio = wagon.currentLoad / wagon.capacity;
      const barWidth = wagonLength * 0.9;
      const barHeight = 0.5;
      const barDepth = wagonWidth * 0.3;
      
      // Background bar
      const bgBarGeo = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
      const bgBarMat = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0,
        roughness: 0.4
      });
      const bgBar = new THREE.Mesh(bgBarGeo, bgBarMat);
      bgBar.position.set(0, 0.3, 0);
      wagonGroup.add(bgBar);

      // Filled bar
      const fillBarGeo = new THREE.BoxGeometry(barWidth * utilizationRatio, barHeight, barDepth);
      const fillColor = utilizationRatio > 0.9 ? 0xef4444 : utilizationRatio > 0.7 ? 0xf59e0b : 0x10b981;
      const fillBarMat = new THREE.MeshStandardMaterial({ 
        color: fillColor,
        emissive: fillColor,
        emissiveIntensity: 0.3,
        roughness: 0.3
      });
      const fillBar = new THREE.Mesh(fillBarGeo, fillBarMat);
      fillBar.position.set(-barWidth / 2 + (barWidth * utilizationRatio) / 2, 0.3, 0);
      wagonGroup.add(fillBar);
    }

    // Orders with different shapes
    let currentX = -wagonLength / 2 + 2;
    const orderYBase = 1;

    wagon.orders.forEach((order, oIdx) => {
      const orderGeo = createOrderGeometry(order);
      const orderMat = new THREE.MeshLambertMaterial({ 
        color: getPriorityColor(order.priority)
      });
      const orderMesh = new THREE.Mesh(orderGeo, orderMat);
      
      let yOffset = orderYBase + order.dimensions.height / 2;
      
      if (order.shape === 'cylinder') {
        orderMesh.rotation.x = Math.PI / 2;
        yOffset = orderYBase + order.dimensions.height / 2;
      } else if (order.shape === 'sphere') {
        yOffset = orderYBase + Math.max(order.dimensions.width, order.dimensions.height) / 2;
      }

      orderMesh.position.set(
        currentX + order.dimensions.length / 2,
        yOffset,
        (oIdx % 2 === 0 ? -2 : 2)
      );
      
      mapRef.current.set(orderMesh.uuid, {
        type: 'order',
        data: order,
        wagon: {
          wagonId: wagon.wagonId,
          wagonColor: wagon.color
        }
      });

      wagonGroup.add(orderMesh);

      currentX += order.dimensions.length + 0.5;
    });

    return wagonGroup;
  };

  // Main Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    if (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.Fog(0xf8fafc, 100, 300);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(80, 60, 80);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = false;
    
    // Handle WebGL context loss
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
    });
    
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
    });
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (simplified)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 30);
    scene.add(dirLight);

    // Ground plane (smaller)
    const groundGeo = new THREE.PlaneGeometry(150, 60);
    const groundMat = new THREE.MeshBasicMaterial({ 
      color: 0xe0f2fe
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid helper (less dense)
    const gridHelper = new THREE.GridHelper(120, 20, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = -0.4;
    scene.add(gridHelper);

    // Rail tracks (simplified)
    const trackGeo = new THREE.BoxGeometry(120, 0.3, 1.5);
    const trackMat = new THREE.MeshBasicMaterial({ 
      color: 0x64748b
    });
    
    const track1 = new THREE.Mesh(trackGeo, trackMat);
    track1.position.set(0, 0, -3);
    scene.add(track1);
    
    const track2 = new THREE.Mesh(trackGeo, trackMat);
    track2.position.set(0, 0, 3);
    scene.add(track2);

    // Generate wagons
    const wagonLength = 30;
    const wagonSpacing = 5;

    rakeData.wagons?.forEach((wagon, wIdx) => {
      const wagonGroup = createWagonWithOrders(wagon, false);
      const xPos = (wIdx - (rakeData.wagons?.length || 0) / 2) * (wagonLength + wagonSpacing) + wagonLength / 2;
      wagonGroup.position.x = xPos;
      scene.add(wagonGroup);
    });

    // Mouse interaction
    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const data = objectMapRef.current.get(obj.uuid);
        
        if (data) {
          renderer.domElement.style.cursor = 'pointer';
          let content = '';
          if (data.type === 'wagon') {
            const totalOrders = data.data.orders.length;
            const utilization = ((data.data.currentLoad / data.data.capacity) * 100).toFixed(1);
            const remaining = data.data.capacity - data.data.currentLoad;
            content = `<div class="font-bold text-base mb-2 text-blue-600">${data.data.wagonId}</div>
                       <div class="text-sm"><span class="font-semibold">Current Load:</span> ${data.data.currentLoad.toLocaleString()} kg</div>
                       <div class="text-sm"><span class="font-semibold">Capacity:</span> ${data.data.capacity.toLocaleString()} kg</div>
                       <div class="text-sm"><span class="font-semibold">Available:</span> ${remaining.toLocaleString()} kg</div>
                       <div class="text-sm"><span class="font-semibold">Utilization:</span> <span class="font-bold">${utilization}%</span></div>
                       <div class="text-sm mt-1"><span class="font-semibold">Orders:</span> ${totalOrders}</div>
                       <div class="text-xs mt-2 text-blue-500 font-semibold">🖱️ Click to view details</div>`;
          } else if (data.type === 'order') {
            const dims = data.data.dimensions;
            content = `<div class="font-bold text-base mb-2 text-purple-600">${data.data.id}</div>
                       <div class="text-sm"><span class="font-semibold">Destination:</span> ${data.data.dest}</div>
                       <div class="text-sm"><span class="font-semibold">Quantity:</span> ${data.data.qty.toLocaleString()} kg</div>
                       <div class="text-sm"><span class="font-semibold">Priority:</span> <span class="font-bold uppercase">${data.data.priority}</span></div>
                       <div class="text-sm"><span class="font-semibold">Shape:</span> ${data.data.shape}</div>
                       <div class="text-sm"><span class="font-semibold">Dimensions:</span> ${dims.length}×${dims.width}×${dims.height}m</div>
                       <div class="text-sm mt-1 text-gray-600">Wagon: ${data.wagon.wagonId}</div>`;
          }
          
          setTooltip({
            visible: true,
            content,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        } else {
          renderer.domElement.style.cursor = 'default';
          setTooltip({ visible: false, content: '', x: 0, y: 0 });
        }
      } else {
        renderer.domElement.style.cursor = 'default';
        setTooltip({ visible: false, content: '', x: 0, y: 0 });
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const data = objectMapRef.current.get(obj.uuid);
        
        if (data && data.type === 'wagon') {
          setSelectedWagon(data.data);
          setTooltip({ visible: false, content: '', x: 0, y: 0 });
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Camera controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let theta = Math.PI / 4;
    let phi = Math.PI / 4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      
      theta -= dx * 0.005;
      phi -= dy * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
      
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const newDistance = camera.position.length() + e.deltaY * zoomSpeed;
      const clampedDistance = Math.max(50, Math.min(200, newDistance));
      const ratio = clampedDistance / camera.position.length();
      camera.position.multiplyScalar(ratio);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseDrag);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (isDragging) {
        const distance = camera.position.length();
        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(0, 5, 0);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseDrag);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Modal Scene
  useEffect(() => {
    if (!selectedWagon || !modalContainerRef.current) return;

    modalObjectMapRef.current.clear();

    // Modal Scene setup
    const modalScene = new THREE.Scene();
    modalScene.background = new THREE.Color(0xffffff);
    modalSceneRef.current = modalScene;

    // Modal Camera
    const modalCamera = new THREE.PerspectiveCamera(
      60,
      modalContainerRef.current.clientWidth / modalContainerRef.current.clientHeight,
      0.1,
      1000
    );
    modalCamera.position.set(0, 12, 35);
    modalCamera.lookAt(0, 4, 0);
    modalCameraRef.current = modalCamera;

    // Modal Renderer
    const modalRenderer = new THREE.WebGLRenderer({ 
      antialias: false,
      powerPreference: "high-performance"
    });
    modalRenderer.setSize(modalContainerRef.current.clientWidth, modalContainerRef.current.clientHeight);
    modalRenderer.shadowMap.enabled = false;
    
    // Handle WebGL context loss for modal
    modalRenderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('Modal WebGL context lost');
    });
    
    modalRenderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('Modal WebGL context restored');
    });
    
    modalContainerRef.current.appendChild(modalRenderer.domElement);
    modalRendererRef.current = modalRenderer;

    // Modal Lighting (simplified)
    const modalAmbient = new THREE.AmbientLight(0xffffff, 1.5);
    modalScene.add(modalAmbient);

    const modalDirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    modalDirLight.position.set(30, 40, 20);
    modalScene.add(modalDirLight);

    // Modal Ground (smaller)
    const modalGroundGeo = new THREE.PlaneGeometry(50, 40);
    const modalGroundMat = new THREE.MeshBasicMaterial({ 
      color: 0xf1f5f9
    });
    const modalGround = new THREE.Mesh(modalGroundGeo, modalGroundMat);
    modalGround.rotation.x = -Math.PI / 2;
    modalGround.position.y = -0.5;
    modalScene.add(modalGround);

    // Add grid to modal (less dense)
    const modalGrid = new THREE.GridHelper(40, 15, 0x94a3b8, 0xe2e8f0);
    modalGrid.position.y = -0.4;
    modalScene.add(modalGrid);

    // Add wagon to modal
    const wagonGroup = createWagonWithOrders(selectedWagon, true);
    modalScene.add(wagonGroup);

    // Modal mouse interaction
    const modalMouse = new THREE.Vector2();
    const modalRaycaster = new THREE.Raycaster();

    const onModalMouseMove = (e: MouseEvent) => {
      const rect = modalRenderer.domElement.getBoundingClientRect();
      modalMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      modalMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      modalRaycaster.setFromCamera(modalMouse, modalCamera);
      const intersects = modalRaycaster.intersectObjects(modalScene.children, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const data = modalObjectMapRef.current.get(obj.uuid);
        
        if (data && data.type === 'order') {
          modalRenderer.domElement.style.cursor = 'pointer';
          const dims = data.data.dimensions;
          const content = `<div class="font-bold text-base mb-2 text-purple-600">${data.data.id}</div>
                     <div class="text-sm"><span class="font-semibold">Destination:</span> ${data.data.dest}</div>
                     <div class="text-sm"><span class="font-semibold">Quantity:</span> ${data.data.qty.toLocaleString()} kg</div>
                     <div class="text-sm"><span class="font-semibold">Priority:</span> <span class="font-bold uppercase">${data.data.priority}</span></div>
                     <div class="text-sm"><span class="font-semibold">Shape:</span> ${data.data.shape}</div>
                     <div class="text-sm"><span class="font-semibold">Dimensions:</span> ${dims.length}×${dims.width}×${dims.height}m</div>`;
          
          setTooltip({
            visible: true,
            content,
            x: e.clientX,
            y: e.clientY
          });
        } else {
          modalRenderer.domElement.style.cursor = 'default';
          setTooltip({ visible: false, content: '', x: 0, y: 0 });
        }
      } else {
        modalRenderer.domElement.style.cursor = 'default';
        setTooltip({ visible: false, content: '', x: 0, y: 0 });
      }
    };

    modalRenderer.domElement.addEventListener('mousemove', onModalMouseMove);

    // Modal camera controls
    let modalIsDragging = false;
    let modalPrevMouse = { x: 0, y: 0 };
    let modalTheta = Math.PI / 2;
    let modalPhi = Math.PI / 3;

    const onModalMouseDown = (e: MouseEvent) => {
      modalIsDragging = true;
      modalPrevMouse = { x: e.clientX, y: e.clientY };
    };

    const onModalMouseUp = () => {
      modalIsDragging = false;
    };

    const onModalMouseDrag = (e: MouseEvent) => {
      if (!modalIsDragging) return;
      
      const dx = e.clientX - modalPrevMouse.x;
      const dy = e.clientY - modalPrevMouse.y;
      
      modalTheta -= dx * 0.008;
      modalPhi -= dy * 0.008;
      modalPhi = Math.max(0.1, Math.min(Math.PI - 0.1, modalPhi));
      
      modalPrevMouse = { x: e.clientX, y: e.clientY };
    };

    const onModalWheel = (e: WheelEvent) => {
      const rect = modalRenderer.domElement.getBoundingClientRect();
      const isOverCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                          e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (isOverCanvas) {
        e.preventDefault();
        const zoomSpeed = 0.08;
        const newDistance = modalCamera.position.length() + e.deltaY * zoomSpeed;
        const clampedDistance = Math.max(20, Math.min(80, newDistance));
        const ratio = clampedDistance / modalCamera.position.length();
        modalCamera.position.multiplyScalar(ratio);
      }
    };

    modalRenderer.domElement.addEventListener('mousedown', onModalMouseDown);
    modalRenderer.domElement.addEventListener('mouseup', onModalMouseUp);
    modalRenderer.domElement.addEventListener('mousemove', onModalMouseDrag);
    modalRenderer.domElement.addEventListener('wheel', onModalWheel);

    // Modal animation loop
    const modalAnimate = (): void => {
      modalAnimationRef.current = requestAnimationFrame(modalAnimate);
      
      if (modalIsDragging) {
        const distance = modalCamera.position.length();
        modalCamera.position.x = distance * Math.sin(modalPhi) * Math.cos(modalTheta);
        modalCamera.position.y = distance * Math.cos(modalPhi);
        modalCamera.position.z = distance * Math.sin(modalPhi) * Math.sin(modalTheta);
        modalCamera.lookAt(0, 4, 0);
      }
      
      modalRenderer.render(modalScene, modalCamera);
    };
    modalAnimate();

    // Modal resize handler
    const handleModalResize = (): void => {
      if (!modalContainerRef.current) return;
      modalCamera.aspect = modalContainerRef.current.clientWidth / modalContainerRef.current.clientHeight;
      modalCamera.updateProjectionMatrix();
      modalRenderer.setSize(modalContainerRef.current.clientWidth, modalContainerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleModalResize);

    return () => {
      if (modalAnimationRef.current) {
        cancelAnimationFrame(modalAnimationRef.current);
      }
      window.removeEventListener('resize', handleModalResize);
      modalRenderer.domElement.removeEventListener('mousemove', onModalMouseMove);
      modalRenderer.domElement.removeEventListener('mousedown', onModalMouseDown);
      modalRenderer.domElement.removeEventListener('mouseup', onModalMouseUp);
      modalRenderer.domElement.removeEventListener('mousemove', onModalMouseDrag);
      modalRenderer.domElement.removeEventListener('wheel', onModalWheel);
      if (modalContainerRef.current && modalRenderer.domElement.parentNode === modalContainerRef.current) {
        modalContainerRef.current.removeChild(modalRenderer.domElement);
      }
    };
  }, [selectedWagon]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-background to-muted/20 relative">
      {/* Main 3D View */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Minimalist Info Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Rake ID:</span>
            <span className="text-sm font-bold text-foreground">{rakeData.rakeId}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Wagons:</span>
            <span className="text-sm font-bold text-foreground">{rakeData.wagons?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="absolute z-20 bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg shadow-xl p-3 pointer-events-none max-w-xs"
          style={{ 
            left: `${tooltip.x + 15}px`, 
            top: `${tooltip.y + 15}px`,
            transform: 'translate(0, -50%)'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {/* Minimalist Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <h3 className="font-semibold text-foreground mb-2 text-xs">Priority</h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ff4444' }}></div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ffaa00' }}></div>
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#00cc66' }}></div>
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-3 py-2">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><span className="font-medium">Drag</span> to rotate</p>
        <p className="flex items-center gap-2"><span className="font-medium">Scroll</span> to zoom</p>
        <p className="flex items-center gap-2"><span className="font-medium">Click</span> wagon for details</p>
      </div>
    </div>

    {/* Modal */}
    {selectedWagon && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedWagon(null);
            setTooltip({ visible: false, content: '', x: 0, y: 0 });
            setIsOrdersDropdownOpen(true);
          }
        }}
      >
        <div className="bg-card rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 flex justify-between items-center border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedWagon.wagonId} - Detailed View</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Load: <span className="font-semibold text-foreground">{selectedWagon.currentLoad.toLocaleString()}</span> / {selectedWagon.capacity.toLocaleString()} kg 
                <span className="ml-2 text-primary font-semibold">({((selectedWagon.currentLoad / selectedWagon.capacity) * 100).toFixed(1)}%)</span>
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedWagon(null);
                setTooltip({ visible: false, content: '', x: 0, y: 0 });
                setIsOrdersDropdownOpen(true);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
            >
              ×
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 flex flex-col">
            {/* 3D View - Top Section */}
            <div className="flex-1 relative bg-muted/20">
              <div ref={modalContainerRef} className="w-full h-full" />
              <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg">
                <p className="flex items-center gap-2"><span className="font-medium">Drag</span> to rotate</p>
                <p className="flex items-center gap-2"><span className="font-medium">Scroll</span> to zoom</p>
                <p className="flex items-center gap-2"><span className="font-medium">Hover</span> for info</p>
              </div>
            </div>

            {/* Order Details Dropdown - Bottom Section */}
            <div className="border-t border-border bg-card">
              <div className="border-b border-border">
                <button 
                  onClick={() => setIsOrdersDropdownOpen(!isOrdersDropdownOpen)}
                  className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors focus:outline-none text-left"
                >
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    Orders in Wagon 
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                      {selectedWagon.orders.length}
                    </span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      Total: <span className="text-foreground font-semibold">{selectedWagon.currentLoad.toLocaleString()} kg</span>
                    </span>
                    <svg 
                      className={`w-4 h-4 text-muted-foreground transform transition-transform ${
                        isOrdersDropdownOpen ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>
              
              {/* Dropdown Content */}
              {isOrdersDropdownOpen && (
                <div className="px-4 pb-4 pt-3 max-h-64 overflow-y-auto">
                  <div className="space-y-2.5">
                    {selectedWagon.orders.map((order) => (
                      <div 
                        key={order.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-all bg-card hover:bg-muted/30"
                        style={{ borderColor: `#${getPriorityColor(order.priority).toString(16).padStart(6, '0')}40` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-foreground text-sm">{order.id}</span>
                          <span 
                            className="text-xs font-semibold px-2 py-0.5 rounded uppercase"
                            style={{ 
                              backgroundColor: `#${getPriorityColor(order.priority).toString(16).padStart(6, '0')}`,
                              color: 'white'
                            }}
                          >
                            {order.priority}
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <p><span className="font-medium text-foreground">Destination:</span> {order.dest}</p>
                          <p><span className="font-medium text-foreground">Quantity:</span> {order.qty.toLocaleString()} kg</p>
                          <p><span className="font-medium text-foreground">Shape:</span> {order.shape}</p>
                          <p><span className="font-medium text-foreground">Dimensions:</span> {order.dimensions.length}×{order.dimensions.width}×{order.dimensions.height}m</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default RakeVisualization;