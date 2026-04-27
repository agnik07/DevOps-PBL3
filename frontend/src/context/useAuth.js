import { useContext } from "react";
import AuthContext from "./AuthContextContext";

export const useAuth = () => useContext(AuthContext);

