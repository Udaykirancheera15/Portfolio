// Blockchain canvas animation
function setupBlockchainAnimation() {
    const canvas = document.getElementById('blockchain-canvas');
    const nodes = [];
    const connections = [];
    const nodeCount = 8;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'absolute w-3 h-3 rounded-full bg-purple-500 node';
        node.style.left = `${Math.random() * 90 + 5}%`;
        node.style.top = `${Math.random() * 90 + 5}%`;
        node.style.animationDelay = `${Math.random() * 2}s`;
        canvas.appendChild(node);
        nodes.push(node);
    }
    
    // Create connections
    for (let i = 0; i < nodes.length; i++) {
        const connections = Math.floor(Math.random() * 3) + 1; // 1-3 connections per node
        for (let j = 0; j < connections; j++) {
            const targetIndex = (i + j + 1) % nodes.length;
            createConnection(nodes[i], nodes[targetIndex]);
        }
    }
    
    function createConnection(nodeA, nodeB) {
        const connection = document.createElement('div');
        connection.className = 'absolute bg-gradient-to-r from-purple-500/30 to-pink-500/30';
        connection.style.height = '1px';
        connection.style.transformOrigin = 'left center';
        canvas.appendChild(connection);
        
        // Update line position
        function updateConnection() {
            const rectA = nodeA.getBoundingClientRect();
            const rectB = nodeB.getBoundingClientRect();
            
            const canvasRect = canvas.getBoundingClientRect();
            
            const x1 = rectA.left + rectA.width/2 - canvasRect.left;
            const y1 = rectA.top + rectA.height/2 - canvasRect.top;
            const x2 = rectB.left + rectB.width/2 - canvasRect.left;
            const y2 = rectB.top + rectB.height/2 - canvasRect.top;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            
            connection.style.width = `${length}px`;
            connection.style.left = `${x1}px`;
            connection.style.top = `${y1}px`;
            connection.style.transform = `rotate(${angle}deg)`;
        }
        
        updateConnection();
        connections.push(updateConnection);
    }
    
    // Animate nodes
    function animateNodes() {
        nodes.forEach(node => {
            const currentLeft = parseFloat(node.style.left);
            const currentTop = parseFloat(node.style.top);
            
            const newLeft = currentLeft + (Math.random() - 0.5) * 0.5;
            const newTop = currentTop + (Math.random() - 0.5) * 0.5;
            
            // Keep within bounds
            node.style.left = `${Math.max(5, Math.min(95, newLeft))}%`;
            node.style.top = `${Math.max(5, Math.min(95, newTop))}%`;
        });
        
        // Update connections
        connections.forEach(updateFunc => updateFunc());
        
        requestAnimationFrame(animateNodes);
    }
    
    animateNodes();
}

// Initialize blockchain animation when the DOM is ready
document.addEventListener('DOMContentLoaded', setupBlockchainAnimation);
