import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Footer from 'components/Footer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: '#2d2d2d',
    },
    appBar: {
      [theme.breakpoints.up('sm')]: {
        width: `100%`,
      }
        },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
    },
    menuItem: {
      color: '#fff',
    },
    
  }),
);

interface LayoutProps {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container?: Element;
}

export const Layout: React.FC<LayoutProps> = (props: any) => {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
          <Typography variant="h6" noWrap>
            📸 DogSnap - Dog Breeds CategorAIzer 🐕🐩
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.children}
      </main>    
      <Footer />
    </div>
  );
}