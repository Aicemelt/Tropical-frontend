import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {setNavigator} from "../../services/api"; // api.js에 setNavigator가 있다고 가정

export default function NavigatorInit() {
    const navigate = useNavigate();
    useEffect(() => {
        setNavigator(navigate);
    }, [navigate]);
    return null;
}
