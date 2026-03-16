import axios from "axios";

const api = axios.create({
    baseURL:"http://localhost:5000",
    withCredentials:true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},(error)=>Promise.reject(error)
);

api.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originalRequest = error.config;

        if(error.response?.status===401 && !originalRequest._retry){
            originalRequest._retry=true;

            try{
                const res = await api.post("/api/refresh");
                localStorage.setItem("accessToken",res.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return api(originalRequest);
            }
            catch(error){
                localStorage.remove("refreshToken");
                window.location.href = "/";
            }
        }
        return Promise.reject(error)
    }
);

export default api;