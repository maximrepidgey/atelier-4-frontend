/// <reference types="cypress" />

describe('Testing the house page', function () {
    
    beforeEach(() => {
        cy.Login()
        cy.visit('/house')
        cy.route("GET", "**/rooms", "fixture:rooms.json").as("getRooms");
      })

    it('testing all the buttons', function () {
        cy.contains('My Rooms')
        cy.contains('Name')
        cy.contains('Devices')

        cy.get(".btn-primary-circular")
            .click()
        cy.url()
            .should('include', '/addRoom')
        cy.visit('/house')

        cy.get(".btn-edit")
            .first()
            .click({force: true})
        cy.url()
            .should('include', '/editRoom?id=1')
        cy.visit('/house')

        cy.get(".btn-edit").eq(1)
            .click({force: true})
        cy.url()
            .should('include', '/room?id=1')
        cy.visit('/house')

    })
})
