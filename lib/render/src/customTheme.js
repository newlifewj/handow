
import { createMuiTheme } from '@material-ui/core/styles';

const wbsTheme = createMuiTheme({
    palette: {
        // primary: { main: '#45f300' }, // Purple and green play nicely together.
        // secondary: { main: '#11cb5f' }, // This is just green.A700 as hex.
        primary: {
            light: '#00acc1',
            main: '#00838f',
            dark: '#006064',
            contrastText: '#fff'
        },
        secondary: {
            light: '#c02828',
            main: '#b22222',
            dark: '#901818',
            contrastText: '#fff'
        },
        error: {
            light: '#ff8070',
            main: '#ff6347',
            dark: '#e04030'
        }
    },
    typography: { useNextVariants: true }
});

export default wbsTheme;