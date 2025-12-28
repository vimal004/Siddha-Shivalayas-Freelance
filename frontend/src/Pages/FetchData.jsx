import { useState, useEffect } from "react";
import { authAxios } from "../services/authService";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authAxios
      .get(url)
      .then((response) => {
        setData(response.data.data || response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error, setData };
};

export default useFetchData;
