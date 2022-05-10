import React, {useEffect, useState} from 'react'
import DevicesPanel from '../devices/DevicesPanel'
import ScenesPanel from '../scenes/ScenesPanel'
import {useHistory} from 'react-router';
import queryString from 'query-string'


/**
 * Returns the different shared panel according to the requested view
 * @returns {*}
 * @constructor
 */
const SharedWithGuests = () => {
    const [activePanel, setActivePanel] = useState("0")
    const host = window.location.protocol + '//' + window.location.hostname + ':3000';
    const history = useHistory()
    const params = queryString.parse(history.location.search)

    /**
     * Manages access to views, serving the requested view according
     * to owner username and selected view. Else, redirects back to
     * /sharedWithMe. Runs once on page load.
     */
    useEffect(() => {
        if ((params.owner && !params.view) ||
            (!params.owner && params.view) ||
            (!params.owner || !params.view)) {
            window.location.replace(host + "/sharedWithMe")
        }

        if (params.owner && params.view) {
            switch (params.view) {
                case "0": //DevicesPanel
                    setActivePanel("0")
                    break;
                case "1"://ScenesPanel
                    setActivePanel("1")
                    break;
                default:
                    window.location.replace(host + "/sharedWithMe")
                    break;
            }
            // window.location.replace(host + "/shared?owner=" + params.owner + "&view=0")
        }
    }, [host, params.owner, params.view])


    /**
     * Manages the changes of the views according to the query strings.
     * Avoids page reload, and thus, re fetching.
     */
    useEffect(() => {
        return history.listen((location) => {
            const values = queryString.parse(location.search)

            switch (values.view) {
                case "0": //DevicesPanel
                    setActivePanel("0")
                    break;
                case "1"://ScenesPanel
                    setActivePanel("1")
                    break;
                default:
                    window.location.replace(host + "/sharedWithMe")
                    break;
            }
        })
    }, [history, host])

    return (
        <>
            <div className={activePanel === "0" ? undefined : "display-none"}>
                <DevicesPanel/>
            </div>

            <div className={activePanel === "1" ? undefined : "display-none"}>
                <ScenesPanel/>
            </div>
        </>
    )
};

export {SharedWithGuests as default}
