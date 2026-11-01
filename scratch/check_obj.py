xs, ys, zs = [], [], []
with open('head.obj') as f:
    for line in f:
        if line.startswith('v '):
            parts = line.strip().split()
            xs.append(float(parts[1]))
            ys.append(float(parts[2]))
            zs.append(float(parts[3]))
print('X:', min(xs), max(xs), 'size:', max(xs)-min(xs))
print('Y:', min(ys), max(ys), 'size:', max(ys)-min(ys))
print('Z:', min(zs), max(zs), 'size:', max(zs)-min(zs))
