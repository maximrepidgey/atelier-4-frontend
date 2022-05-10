/// <reference types="cypress" />

describe('test the edit device page', function () {
    beforeEach(() => {
        cy.Login()
    })

    it('testing all the buttons', function () {
        cy.fixture('headers.json').then((headers) => {
            cy.server()
            cy.route({
                url: 'http://localhost:8080/auth/validate',
                method: "POST",
                headers: headers,
                response: "user1"
            })
            cy.route({
                url: 'http://localhost:8080/devices/1',
                method: "GET",
                headers: headers,
                response: "fixture:devices.json"
            })

            cy.visit('/editDevice?id=1')
            cy.contains('Edit Device')

            cy.get('.Handle-btn-secondary').first()
                .click()
            cy.url()
                .should('include', '/devices')
            cy.visit('/editDevice?id=1')
        })
    })
})  