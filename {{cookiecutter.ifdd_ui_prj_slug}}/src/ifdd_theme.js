import {createTheme} from '@mui/material/styles';

// MUI moved from `overrides` (v4) to `components.<Name>.styleOverrides` (v5+).
// The previous `overrides` block was silently ignored by MUI and had no effect.
const accent = '#F9AE00';
const ink = '#333333';

export const ifddTheme = createTheme({
    palette: {
        secondary: {
            light: '#0000ff',
            main: ink,
            contrastText: accent,
        },
        contrastThreshold: 3,
        tonalOffset: 0.2,
        background: {
            paper: '#f0f0f0',
            default: '#f0f0f0',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                textPrimary: {color: ink},
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {backgroundColor: '#f8f8f8'},
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {backgroundColor: accent},
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {'&:hover': {backgroundColor: '#DDDDDD'}},
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {fill: accent},
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                colorPrimary: {backgroundColor: '#C0C0C0'},
                barColorPrimary: {backgroundColor: accent},
            },
        },
    },
});
