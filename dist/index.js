'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * get a value from an object using dot notation
 * taken from https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
 *
 * @param {object} object
 * @param {string} path
 */
var Get = function (object, path) {
    if (!path) {
        return undefined;
    }
    path = path.split('.');
    return path.reduce(function (xs, x) { return (xs && xs[x]) ? xs[x] : null; }, object);
};

/**
 * set a value into an object using dot notation
 * @param object
 * @param path
 * @param value
 */
var Set = function (object, path, value) {
    if (!path) {
        return undefined;
    }
    var pathParts = path.split('.');
    pathParts.forEach(function (part, index) {
        if (index === pathParts.length - 1) {
            object[part] = value;
        }
        // if it doesnt exist, make it an empty object
        // unless the next part is a pure number - in which case, make it an array
        if (object[part] == null) {
            if (isNaN(pathParts[index + 1])) {
                object[part] = {};
            }
            else {
                object[part] = [];
            }
        }
        object = object[part];
    });
    return object;
};

var left = 'LEFT';
var right = 'RIGHT';
var up = 'UP';
var down = 'DOWN';
var enter = 'ENTER';
var KeyCodes = {
    map: {
        LEFT: left,
        RIGHT: right,
        UP: up,
        DOWN: down,
        ENTER: enter
    },
    codes: {
        4: left,
        21: left,
        37: left,
        214: left,
        205: left,
        218: left,
        5: right,
        22: right,
        39: right,
        213: right,
        206: right,
        217: right,
        29460: up,
        19: up,
        38: up,
        211: up,
        203: up,
        215: up,
        29461: down,
        20: down,
        40: down,
        212: down,
        204: down,
        216: down,
        29443: enter,
        13: enter,
        67: enter,
        32: enter,
        23: enter,
        195: enter
    }
};

//      
// An event handler can take an optional event argument
// and should not return a value
                                          
                                                               

// An array of all currently registered event handlers for a type
                                            
                                                            
// A map of event types and their corresponding event handlers.
                        
                                 
                                   
  

/** Mitt: Tiny (~200b) functional event emitter / pubsub.
 *  @name mitt
 *  @returns {Mitt}
 */
function mitt(all                 ) {
	all = all || Object.create(null);

	return {
		/**
		 * Register an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to listen for, or `"*"` for all events
		 * @param  {Function} handler Function to call in response to given event
		 * @memberOf mitt
		 */
		on: function on(type        , handler              ) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * Remove an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
		 * @param  {Function} handler Handler function to remove
		 * @memberOf mitt
		 */
		off: function off(type        , handler              ) {
			if (all[type]) {
				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
			}
		},

		/**
		 * Invoke all handlers for the given type.
		 * If present, `"*"` handlers are invoked after type-matched handlers.
		 *
		 * @param {String} type  The event type to invoke
		 * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
		 * @memberOf mitt
		 */
		emit: function emit(type        , evt     ) {
			(all[type] || []).slice().map(function (handler) { handler(evt); });
			(all['*'] || []).slice().map(function (handler) { handler(type, evt); });
		}
	};
}

/**
 * given an array of values and a goal, return the value from values which is closest to the goal
 * @param {number[]} values
 * @param {number} goal
 */
var Closest = function (values, goal) { return values.reduce(function (prev, curr) {
    return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
}); };
/**
 * check if a given node is focusable
 * @param {object} node
 */
var isFocusable = function (node) { return !!(node.selectAction || node.isFocusable); };
/**
 * given a keyCode, lookup and return the direction from the keycodes mapping file
 * @param {number} keyCode
 */
var getDirectionForKeyCode = function (keyCode) {
    var direction = KeyCodes.codes[keyCode];
    if (direction) {
        return direction.toUpperCase();
    }
    return null;
};
var Lrud = /** @class */ (function () {
    function Lrud() {
        this.tree = {};
        this.nodePathList = [];
        this.focusableNodePathList = [];
        this.rootNodeId = null;
        this.currentFocusNodeId = null;
        this.currentFocusNodeIndex = null;
        this.currentFocusNodeIndexRange = null;
        this.isIndexAlignMode = false;
        this.emitter = new mitt();
        this.overrides = {};
    }
    /**
     * given an orientation and a direction, do they match? i.e an
     * orientation `horizontal` and direction `left` or `right` is considered matching.
     *
     * direction CAN be passed as `*` (wildcard). this will always return true
     *
     * @param {string} orientation
     * @param {string} direction
     */
    Lrud.prototype.isDirectionAndOrientationMatching = function (orientation, direction) {
        if (!orientation || !direction) {
            return false;
        }
        orientation = orientation.toUpperCase();
        direction = direction.toUpperCase();
        return ((direction === '*') ||
            (orientation === 'VERTICAL' && (direction === 'UP' || direction === 'DOWN')) ||
            (orientation === 'HORIZONTAL' && (direction === 'LEFT' || direction === 'RIGHT')));
    };
    /**
     * register a callback for an LRUD event
     *
     * @param {string} eventName event to subscribe to
     * @param {function} callback function to call on event
     */
    Lrud.prototype.on = function (eventName, callback) {
        this.emitter.on(eventName, callback);
    };
    /**
     * return the root node
     */
    Lrud.prototype.getRootNode = function () {
        var node = this.getNode(this.rootNodeId);
        if (!node) {
            throw new Error('no root node');
        }
        return node;
    };
    /**
     * given a node id, return the full path for it
     *
     * @param {string} nodeId
     */
    Lrud.prototype.getPathForNodeId = function (nodeId) {
        if (nodeId === this.rootNodeId) {
            return this.rootNodeId;
        }
        return this.nodePathList.find(function (path) { return path.endsWith('.' + nodeId); });
    };
    /**
     * register a new node into the LRUD tree
     *
     * @param {string} nodeId
     * @param {object} node
     * @param {string} [node.id] if null, `nodeId` is used
     * @param {string} [node.parent] if null, value of `this.rootNodeId` is used
     * @param {number} [node.index] if null, index is 1 more than the index of the last sibling. if no previous siblings, index is 1
     * @param {number[]} [node.indexRange] defaults to null. acts as a colspan, value [0] is lower bound, value [1] is upper bound
     * @param {function} [node.selectAction] if a node has a selectAction, it is focusabled
     * @param {boolean} [node.isFocusable] if a node is explicitly set as isFocusable, it is focusable
     * @param {boolean} [node.isWrapping] if true, when asking for the next child at the end or start of the node, the will "wrap around" and return the first/last (when asking for the last/first)
     * @param {string} [node.orientation] can be "vertical" or "horizontal". is used in conjuction when handling direction of key press, to determine which child is "next"
     * @param {boolean} [node.isIndexAlign] if a node is index aligned, its descendents should jump to nodes based on index instead of activeChild
     * @param {function} [node.onLeave] if a node has an `onLeave` function, it will be run when a move event leaves this node
     * @param {function} [node.onEnter] if a node has an `onEnter` function, it will be run when a move event enters this node
     */
    Lrud.prototype.registerNode = function (nodeId, node) {
        if (node === void 0) { node = {}; }
        if (!node.id) {
            node.id = nodeId;
        }
        // if this is the very first node, set it as root and return...
        if (Object.keys(this.tree).length <= 0) {
            this.rootNodeId = nodeId;
            this.tree[nodeId] = node;
            this.nodePathList.push(nodeId);
            return this;
        }
        // if this node DOESNT have a parent assume its parent is root
        if (node.parent == null && nodeId !== this.rootNodeId) {
            node.parent = this.rootNodeId;
        }
        // if this node is the first child of its parent, we need to set its parent's `activeChild`
        // to it so that the parent always has an `activeChild` value
        // we can tell if its parent has any children by checking the nodePathList for
        // entries containing '<parent>.children'
        var parentsChildPaths = this.nodePathList.find(function (path) { return path.includes(node.parent + '.children'); });
        if (parentsChildPaths == null) {
            var parentPath = this.getPathForNodeId(node.parent);
            Set(this.tree, parentPath + '.activeChild', nodeId);
        }
        // if no `index` set, calculate it
        if (!node.index) {
            var parentNode = this.getNode(node.parent);
            if (parentNode) {
                var parentsChildren = this.getNode(node.parent).children;
                if (!parentsChildren) {
                    node.index = 0;
                }
                else {
                    node.index = (Object.keys(parentsChildren).length);
                }
            }
        }
        // add the node into the tree
        // path is the node's parent plus 'children' plus itself
        var path = this.nodePathList.find(function (path) { return path.endsWith(node.parent); }) + '.children.' + nodeId;
        Set(this.tree, path, node);
        this.nodePathList.push(path);
        // if the node is focusable, we want to add its path to our focusableNodePathList
        if (isFocusable(node)) {
            this.focusableNodePathList.push(path);
        }
        return this;
    };
    /**
     * maintained for legacy API reasons
     */
    Lrud.prototype.register = function (nodeId, node) {
        if (node === void 0) { node = {}; }
        return this.registerNode(nodeId, node);
    };
    /**
     * unregister a node from the navigation tree
     * @param {string} nodeId
     */
    Lrud.prototype.unregisterNode = function (nodeId) {
        var _this = this;
        var path = this.getPathForNodeId(nodeId);
        // if we're trying to unregister a node that doesn't exist, exit out
        if (!path) {
            return;
        }
        // get a copy of the node to pass to the blur event, and grab the parent to work with it
        var nodeClone = Get(this.tree, path);
        var parentNode = this.getNode(nodeClone.parent);
        // delete the node itself (delete from the parent and re-set the parent later)
        delete parentNode.children[nodeId];
        // ...remove the relevant entry from the node id list
        this.nodePathList.splice(this.nodePathList.indexOf(path), 1);
        // ...remove all its children from the node ID list
        this.nodePathList = this.nodePathList.filter(function (nodeIdPath) {
            return !(nodeIdPath.includes('.' + nodeId));
        });
        // if the node we're unregistering was focusable, we need to remove it from
        // our focusableNodePathList
        this.focusableNodePathList = this.focusableNodePathList.filter(function (nodeIdPath) {
            return !(nodeIdPath.includes('.' + nodeId));
        });
        // ...if we're unregistering the activeChild of our parent (could be a leaf OR branch)
        // we need to recalculate the focus...
        if (parentNode.activeChild && parentNode.activeChild === nodeId) {
            delete parentNode.activeChild;
            var top_1 = this.climbUp(parentNode, '*');
            var prev = this.getPrevChild(top_1);
            var child = this.digDown(prev);
            this.assignFocus(child.id);
        }
        // ...we need to recalculate the indexes of all the parents children
        this._reindexChildrenOfNode(parentNode);
        // re-set the parent after we've deleted the node itself and amended the parents active child, etc.
        Set(this.tree, this.getPathForNodeId(parentNode.id), parentNode);
        // blur on the nodeClone
        this.emitter.emit('blur', nodeClone);
        if (nodeClone.onBlur) {
            nodeClone.onBlur(nodeClone);
        }
        // if we have any overrides whose target is the node we just unregistered, we should unregister
        // those overrides (thus keeping state clean)
        Object.keys(this.overrides).forEach(function (overrideId) {
            var override = _this.overrides[overrideId];
            if (override.target === nodeClone.id || override.id === nodeClone.id) {
                _this.unregisterOverride(overrideId);
            }
        });
        return this;
    };
    /**
     * register a new override onto the LRUD instance
     *
     * @param {string} overrideId
     * @param {object} override
     */
    Lrud.prototype.registerOverride = function (overrideId, override) {
        if (!overrideId) {
            throw new Error('need an ID to register an override');
        }
        if (this.overrides[overrideId]) {
            throw new Error("override with ID of " + overrideId + " already exists");
        }
        if (!override.id) {
            throw new Error("registering override: " + overrideId + " - missing internal id");
        }
        if (!override.direction) {
            throw new Error("registering override: " + overrideId + " - missing internal direction");
        }
        if (!override.target) {
            throw new Error("registering override: " + overrideId + " - missing internal target");
        }
        this.overrides[overrideId] = override;
        return this;
    };
    /**
     * unregister an override from the LRUD instance
     *
     * @param {string} overrideId
     */
    Lrud.prototype.unregisterOverride = function (overrideId) {
        delete this.overrides[overrideId];
        return this;
    };
    /**
     * return a node for an ID
     *
     * @param {string} nodeId node id
     */
    Lrud.prototype.getNode = function (nodeId) {
        return Get(this.tree, (this.getPathForNodeId(nodeId)));
    };
    /**
     * return a node by ID and then unregister it from the instance
     *
     * @param {string} nodeId node id
     */
    Lrud.prototype.pickNode = function (nodeId) {
        var node = this.getNode(nodeId);
        if (!node) {
            return;
        }
        this.unregisterNode(nodeId);
        return node;
    };
    /**
     * is the given node in the path of ANY node that is focusable
     *
     * @param {*} node
     */
    Lrud.prototype._isNodeInFocusableNodePathList = function (node) {
        var _this = this;
        return this.focusableNodePathList.some(function (nodeIdPath) {
            if (nodeIdPath.includes('.' + node.id + '.')) {
                return true;
            }
            if (node.id === _this.rootNodeId && nodeIdPath.includes(node.id + '.')) {
                return true;
            }
            return false;
        });
    };
    /**
     * starting from a node, climb up the navigation tree until we find a node that can be
     * actioned, based on the given direction. an actionable node is one whose orientation is valid
     * for the given direction, has focusable children and whose activeChild isn't a leaf that is
     * also its current activeChild
     *
     * @param {object} node
     * @param {string} direction
     */
    Lrud.prototype.climbUp = function (node, direction) {
        var _this = this;
        if (!node) {
            return null;
        }
        // if we have a matching override at this point in the climb, return that target node
        var matchingOverrideId = Object.keys(this.overrides).find(function (overrideId) {
            var override = _this.overrides[overrideId];
            return override.id === node.id && override.direction.toUpperCase() === direction.toUpperCase();
        });
        if (matchingOverrideId) {
            return this.getNode(this.overrides[matchingOverrideId].target);
        }
        // if we're on a leaf, climb up
        if (isFocusable(node)) {
            return this.climbUp(this.getNode(node.parent), direction);
        }
        // if the node we're on contains no focusable children, climb up
        if (!this._isNodeInFocusableNodePathList(node)) {
            return this.climbUp(this.getNode(node.parent), direction);
        }
        // we have children, but the orientation doesn't match, so try our parent
        if (!this.isDirectionAndOrientationMatching(node.orientation, direction)) {
            return this.climbUp(this.getNode(node.parent), direction);
        }
        var nextChildInDirection = this.getNextChildInDirection(node, direction);
        // if we dont have a next child, just return the node. this is primarily for use during unregistering
        if (!nextChildInDirection) {
            return node;
        }
        // if the next child in the direction is both the same as this node's activeChild
        // AND a leaf, bubble up too - handles nested wrappers, like docs/test-diagrams/fig-3.png
        var isNextChildCurrentActiveChild = (nextChildInDirection && nextChildInDirection.id === node.activeChild);
        var isNextChildFocusable = isFocusable(this.getNode(node.activeChild));
        var isNodeInFocusablePath = this._isNodeInFocusableNodePathList(node);
        if (isNextChildCurrentActiveChild && (isNextChildFocusable || isNodeInFocusablePath)) {
            return this.climbUp(this.getNode(node.parent), direction);
        }
        return node;
    };
    /**
     * starting from the given node, dig down the navigation tree until we find a focusable
     * leaf, and return it. dig "direction" priority:
     * - index align mode
     * - active child
     * - first child
     *
     * @param {object} node
     */
    Lrud.prototype.digDown = function (node) {
        // if the active child is focusable, return it
        if (isFocusable(node)) {
            return node;
        }
        var parent = this.getNode(node.parent);
        // we're in index align mode, so set the `node.activeChild` to the node's child of the same index
        // that the current `this.currentFocusNodeIndex` is
        // indexAlign mode only applies if the node itself AND its parent aren't both vertical
        if (this.isIndexAlignMode && !(node.orientation === 'vertical' && parent.orientation === 'vertical')) {
            var child = this._findChildWithMatchingIndexRange(node, this.currentFocusNodeIndex);
            if (!child) {
                child = this._findChildWithClosestIndex(node, this.currentFocusNodeIndex, this.currentFocusNodeIndexRange);
            }
            if (child) {
                node.activeChild = child.id;
            }
        }
        // if we dont have an active child, use the first child
        if (!node.activeChild) {
            node.activeChild = this.getNodeFirstChild(node).id;
        }
        var activeChild = this.getNode(node.activeChild);
        if (isFocusable(activeChild)) {
            return activeChild;
        }
        return this.digDown(activeChild);
    };
    /**
     * return a child from the given node whose indexRange encompases the given index
     *
     * @param {object} node
     * @param {number} index
     */
    Lrud.prototype._findChildWithMatchingIndexRange = function (node, index) {
        if (!node.children) {
            return null;
        }
        var childWithIndexRangeSpanningIndex = Object.keys(node.children).find(function (childId) {
            var child = node.children[childId];
            return child.indexRange && (child.indexRange[0] <= index && child.indexRange[1] >= index);
        });
        if (childWithIndexRangeSpanningIndex) {
            return node.children[childWithIndexRangeSpanningIndex];
        }
    };
    /**
     * return a child from the given node whose index is numerically closest to the given
     * index. if an indexRange is provided, first check if the node's activeChild is inside
     * the indexRange. if it is, return the activeChild node instead
     *
     * @param {object} node
     * @param {index} index
     * @param {number[]} indexRange
     */
    Lrud.prototype._findChildWithClosestIndex = function (node, index, indexRange) {
        if (indexRange === void 0) { indexRange = null; }
        if (!node.children) {
            return null;
        }
        // if we have an indexRange, and the nodes active child is inside that index range,
        // just return the active child
        var activeChild = this.getNode(node.activeChild);
        if (indexRange && activeChild && activeChild.index >= indexRange[0] && activeChild.index <= indexRange[1]) {
            return activeChild;
        }
        var indexes = Object.keys(node.children).map(function (childId) { return node.children[childId].index; });
        return this._findChildWithIndex(node, Closest(indexes, index));
    };
    /**
     * return a child from the given node whose index matches the given index
     *
     * @param {object} node
     * @param {number} index
     */
    Lrud.prototype._findChildWithIndex = function (node, index) {
        if (!node.children) {
            return null;
        }
        var childIdWithMatchingIndex = Object.keys(node.children).find(function (childId) {
            var childNode = node.children[childId];
            return childNode.index === index;
        });
        if (childIdWithMatchingIndex) {
            return node.children[childIdWithMatchingIndex];
        }
        return null;
    };
    /**
     * reindex all the children of the node, assigning indexes numerically from 1. maintains
     * original order of indexes, but normalises them all to be 1 based
     *
     * @param {object} node
     */
    Lrud.prototype._reindexChildrenOfNode = function (node) {
        if (!node.children) {
            return;
        }
        var children = Object.keys(node.children).map(function (childId) { return node.children[childId]; });
        children.sort(function (a, b) {
            return a.index - b.index;
        });
        node.children = {};
        children.forEach(function (child, index) {
            child.index = index;
            node.children[child.id] = child;
        });
        Set(this.tree, this.getPathForNodeId(node.id), node);
        return node;
    };
    /**
     * gets the semantic next child for a given direction
     * if the direction is left or up, return the semantic previous child of the node
     * if the direction is right or down, return the semantic next child of the node
     *
     * @param {object} node
     * @param {string} direction
     */
    Lrud.prototype.getNextChildInDirection = function (node, direction) {
        direction = direction.toUpperCase();
        if (node.orientation === 'horizontal' && direction === 'RIGHT') {
            return this.getNextChild(node);
        }
        if (node.orientation === 'horizontal' && direction === 'LEFT') {
            return this.getPrevChild(node);
        }
        if (node.orientation === 'vertical' && direction === 'DOWN') {
            return this.getNextChild(node);
        }
        if (node.orientation === 'vertical' && direction === 'UP') {
            return this.getPrevChild(node);
        }
        return null;
    };
    /**
     * get the semantic "next" child for a node
     *
     * @param {object} node
     */
    Lrud.prototype.getNextChild = function (node) {
        if (!node.activeChild) {
            node.activeChild = this.getNodeFirstChild(node).id;
        }
        var currentActiveIndex = node.children[node.activeChild].index;
        var nextChild = this._findChildWithIndex(node, currentActiveIndex + 1);
        if (!nextChild) {
            if (node.isWrapping) {
                nextChild = this.getNodeFirstChild(node);
            }
            else {
                nextChild = node.children[node.activeChild];
            }
        }
        return nextChild;
    };
    /**
     * get the semantic "previous" child for a node
     * @param {object} node
     */
    Lrud.prototype.getPrevChild = function (node) {
        if (!node.activeChild) {
            node.activeChild = this.getNodeFirstChild(node).id;
        }
        var currentActiveIndex = node.children[node.activeChild].index;
        var prevChild = this._findChildWithIndex(node, currentActiveIndex - 1);
        if (!prevChild) {
            // cant find a prev child, so the prev child is the current child
            if (node.isWrapping) {
                prevChild = this.getNodeLastChild(node);
            }
            else {
                prevChild = node.children[node.activeChild];
            }
        }
        return prevChild;
    };
    /**
     * get the first child of a node, based on index
     * @param {object} node
     */
    Lrud.prototype.getNodeFirstChild = function (node) {
        if (!node.children) {
            return undefined;
        }
        var orderedIndexes = Object.keys(node.children).map(function (childId) { return node.children[childId].index; }).sort();
        return this._findChildWithIndex(node, orderedIndexes[0]);
    };
    /**
     * get the last child of a node, based on index
     * @param {object} node
     */
    Lrud.prototype.getNodeLastChild = function (node) {
        if (!node.children) {
            return undefined;
        }
        var orderedIndexes = Object.keys(node.children).map(function (childId) { return node.children[childId].index; }).sort();
        return this._findChildWithIndex(node, orderedIndexes[orderedIndexes.length - 1]);
    };
    /**
     *
     * @param {object} event
     * @param {string} [event.keyCode]
     * @param {string} [event.direction]
     */
    Lrud.prototype.handleKeyEvent = function (event) {
        var direction = (event.keyCode) ? getDirectionForKeyCode(event.keyCode) : event.direction.toUpperCase();
        var currentFocusNode = this.getNode(this.currentFocusNodeId);
        // if all we're doing is processing an enter, just run the `onSelect` function of the current node...
        if (direction === 'ENTER' && currentFocusNode.onSelect) {
            this.emitter.emit('select', currentFocusNode);
            currentFocusNode.onSelect(currentFocusNode);
            return;
        }
        // climb up from where we are...
        var topNode = this.climbUp(currentFocusNode, direction);
        // ... if we cant find a top node, its an invalid move - just return
        if (!topNode) {
            return;
        }
        // ...if we need to align indexes, turn the flag on now...
        this.isIndexAlignMode = (topNode.isIndexAlign === true);
        // ...get the top's next child in the direction we're going...
        var nextChild = this.getNextChildInDirection(topNode, direction);
        // ...and depending on if we're able to find a child, dig down from the child or from the original top...
        var focusableNode = (nextChild) ? this.digDown(nextChild) : this.digDown(topNode);
        // ...and then assign focus
        this.assignFocus(focusableNode.id);
        // emit events and fire functions now that the move has completed
        this.emitter.emit('move', {
            leave: currentFocusNode,
            enter: focusableNode,
            direction: direction,
            offset: (direction === 'LEFT' || direction === 'UP') ? -1 : 1
        });
        if (topNode.onMove) {
            topNode.onMove({
                node: topNode,
                leave: currentFocusNode,
                enter: focusableNode,
                direction: direction,
                offset: (direction === 'LEFT' || direction === 'UP') ? -1 : 1
            });
        }
        if (currentFocusNode.onLeave) {
            currentFocusNode.onLeave(currentFocusNode);
        }
        if (focusableNode.onEnter) {
            focusableNode.onEnter(focusableNode);
        }
        return focusableNode;
    };
    /**
     * recursively sets the activeChild of the parentId node to the value of the childId node
     * if the parent node has a parent itself, it digs up the tree and sets those activeChild values
     *
     * @param {string} parentId
     * @param {string} childId
     */
    Lrud.prototype._setActiveChild = function (parentId, childId) {
        var child = this.getNode(childId);
        var parent = this.getNode(parentId);
        if (!child) {
            return;
        }
        // the parent already has an active child, and its NOT the same child that we're now setting
        if (parent.activeChild && parent.activeChild !== child.id) {
            var currentActiveChild = this.getNode(parent.activeChild);
            parent.activeChild = child.id;
            this.emitter.emit('inactive', currentActiveChild);
            if (currentActiveChild.onInactive) {
                currentActiveChild.onInactive(currentActiveChild);
            }
            this.emitter.emit('active', child);
            if (child.onActive) {
                child.onActive(child);
            }
            if (parent.onActiveChildChange) {
                parent.onActiveChildChange({
                    node: parent,
                    leave: currentActiveChild,
                    enter: child
                });
            }
        }
        // if the parent has a parent, bubble up
        if (parent.parent) {
            this._setActiveChild(parent.parent, parent.id);
        }
    };
    /**
     * set the current focus of the instance to the given node ID
     * if the given node ID points to a non-focusable node, we dig down from
     * the given node to find a node that can be focused on
     * calls `onFocus` on the given node, if it exists, and emits a `focus` event
     * also calls `onBlur` on the node that WAS focused before this function was called
     *
     * @param {string} nodeId
     */
    Lrud.prototype.assignFocus = function (nodeId) {
        var node = this.getNode(nodeId);
        if (!isFocusable(node)) {
            node = this.digDown(node);
        }
        if (!node) {
            throw new Error('trying to assign focus to a non focusable node');
        }
        if (this.currentFocusNodeId) {
            var previouslyFocusedNode = this.getNode(this.currentFocusNodeId);
            if (previouslyFocusedNode) {
                this.emitter.emit('blur', previouslyFocusedNode);
                if (previouslyFocusedNode.onBlur) {
                    previouslyFocusedNode.onBlur(previouslyFocusedNode);
                }
            }
        }
        this.currentFocusNodeId = node.id;
        if (node.indexRange) {
            this.currentFocusNodeIndex = node.indexRange[0];
            this.currentFocusNodeIndexRange = node.indexRange;
        }
        else {
            this.currentFocusNodeIndex = node.index;
        }
        if (node.parent) {
            this._setActiveChild(node.parent, node.id);
        }
        if (node.onFocus) {
            node.onFocus(node);
        }
        this.emitter.emit('focus', node);
    };
    return Lrud;
}());

exports.Lrud = Lrud;
