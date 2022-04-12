import Head from "next/head";
import { useEffect } from "react";
import "../styles/globals.css";

const App = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Image upload </title>
      <meta name="description" content="image upload" />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      ></link>
    </Head>
    <div className="container">
      <Component {...pageProps} />
    </div>
  </>
);

export default App;
