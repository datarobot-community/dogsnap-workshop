import * as React from "react";
import App from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "styles/theme";
import 'react-html5-camera-photo/build/css/index.css';

class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps, router } = this.props;
    console.log(router)
    return (
      <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <Head>
            <title>My page</title>
          </Head>
          {/* ThemeProvider makes the theme available down the React
              tree thanks to React context. */}

          <CssBaseline />
          <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;
