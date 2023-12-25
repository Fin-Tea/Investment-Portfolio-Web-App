import React from "react";
import PropTypes from "prop-types";

export default function TDALoginLink({ style, redirectUri, consumerKey }) {
  return (
    <div style={{ ...style, textAlign: "center", marginBottom: 12 }}>
      <a
        href={`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&client_id=${encodeURIComponent(consumerKey)}`}
      >
        Login to TD Ameritrade
      </a>
    </div>
  );
}

TDALoginLink.propTypes = {
  style: PropTypes.shape({}),
  redirectUri: PropTypes.string,
  consumerKey: PropTypes.string,
};

TDALoginLink.defaultProps = {
  style: {},
  redirectUri: "",
  consumerKey: "",
};
