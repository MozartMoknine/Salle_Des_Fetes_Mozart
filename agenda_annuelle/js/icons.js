const { useState, useMemo, useCallback, useEffect, useRef } = React;

function svg(props, ...children) {
  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: props.className,
    style: props.style
  }, ...children);
}

const Icons = {
  ChevronLeft: (props) => svg(props, React.createElement('path', { d: 'm 15 18-6-6 6-6' })),
  ChevronRight: (props) => svg(props, React.createElement('path', { d: 'm 9 18 6-6-6-6' })),
  Printer: (props) => svg(props,
    React.createElement('polyline', { points: '6 9 6 2 18 2 18 9' }),
    React.createElement('path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }),
    React.createElement('rect', { x: 6, y: 14, width: 12, height: 8 })
  ),
  Settings: (props) => svg(props,
    React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    React.createElement('circle', { cx: 12, cy: 12, r: 3 })
  ),
  BookOpen: (props) => svg(props,
    React.createElement('path', { d: 'M12 7v14' }),
    React.createElement('path', { d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z' })
  ),
  Calendar: (props) => svg(props,
    React.createElement('path', { d: 'M8 2v4' }),
    React.createElement('path', { d: 'M16 2v4' }),
    React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
    React.createElement('path', { d: 'M3 10h18' })
  ),
  X: (props) => svg(props,
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm 6 6 12 12' })
  ),
  Upload: (props) => svg(props,
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '17 8 12 3 7 8' }),
    React.createElement('line', { x1: 12, y1: 3, x2: 12, y2: 15 })
  ),
  ImageIcon: (props) => svg(props,
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
    React.createElement('circle', { cx: 9, cy: 9, r: 2 }),
    React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' })
  ),
  Type: (props) => svg(props,
    React.createElement('polyline', { points: '4 7 4 4 20 4 20 7' }),
    React.createElement('line', { x1: 9, y1: 20, x2: 15, y2: 20 }),
    React.createElement('line', { x1: 12, y1: 4, x2: 12, y2: 20 })
  ),
  Palette: (props) => svg(props,
    React.createElement('circle', { cx: '13.5', cy: '6.5', r: '.5', fill: 'currentColor' }),
    React.createElement('circle', { cx: '17.5', cy: '10.5', r: '.5', fill: 'currentColor' }),
    React.createElement('circle', { cx: '8.5', cy: '7.5', r: '.5', fill: 'currentColor' }),
    React.createElement('circle', { cx: '6.5', cy: '12.5', r: '.5', fill: 'currentColor' }),
    React.createElement('path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z' })
  ),
  RotateCcw: (props) => svg(props,
    React.createElement('path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
    React.createElement('path', { d: 'M3 3v5h5' })
  ),
  Phone: (props) => svg(props,
    React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
  ),
  Mail: (props) => svg(props,
    React.createElement('rect', { x: 2, y: 4, width: 20, height: 16, rx: 2 }),
    React.createElement('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' })
  ),
  MapPin: (props) => svg(props,
    React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    React.createElement('circle', { cx: 12, cy: 10, r: 3 })
  ),
  User: (props) => svg(props,
    React.createElement('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: 12, cy: 7, r: 4 })
  ),
};
