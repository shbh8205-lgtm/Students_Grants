import { BrowserRouter } from "react-router"
import { Routing } from "./routing/routing"
import { Links } from "./routing/links"

export const Main = () => {

    return <>
        <BrowserRouter>
            <Links></Links><br />
            <Routing></Routing>
        </BrowserRouter>
    </>
}