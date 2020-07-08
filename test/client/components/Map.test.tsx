import 'jsdom-global/register'

import * as React from 'react'
import { render } from 'react-dom'
import { act } from "react-dom/test-utils"

import Map from "../../../src/client/components/Map"

describe('<Map />', function() {
    let rootContainer: any

    beforeEach(() => {
        rootContainer = document.createElement("div")
        document.body.appendChild(rootContainer)
    })

    afterEach(() => {
        document.body.removeChild(rootContainer)
        rootContainer = null
    })

    it('should create mapnik projection on class create', () => {
        act(() => {
            render(<Map/>, rootContainer)
        })
    })
})

