function constant(x) {
  return function () {
    return x;
  };
}

export function forcePosition(x, y) {
  var nodes,
    strength = 0.1;

  if (typeof x !== "function") x = constant(x == null ? 0 : +x);
  if (typeof y !== "function") y = constant(y == null ? 0 : +y);

  function force(alpha) {
    var k = -strength * alpha;
    for (var i = 0, n = nodes.length; i < n; ++i) {
      var node = nodes[i],
        dx = node.x - +x(nodes[i], i, nodes) || 1e-6,
        dy = node.y - +y(nodes[i], i, nodes) || 1e-6;
      node.vx += dx * k;
      node.vy += dy * k;
    }
  }

  force.initialize = function (_) {
    nodes = _;
  };

  force.strength = function (_) {
    if (typeof _ === "function") strength = _();
    else strength = +_;
    return force;
  };

  return force;
}
