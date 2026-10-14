export function validityColor(validity) {
    switch (validity) {
        case 'dummy':
            return '#FFE8E8';
        case 'valid':
            return '#E8FFE8';
        default:
            return '#FFFFE8';
    }
}
