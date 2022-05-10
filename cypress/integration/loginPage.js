/// <reference types="cypress" />

describe('Testing the login page', function () {
    
    beforeEach(() => {
        cy.visit('/login')
      })

    it('testing all the buttons', function () {
        cy.contains('Log in')

        cy.get('.btn-secondary')
            .contains('Create account')
        
        cy.get('.btn-primary')
            .contains('Log in')

        cy.get('.primary-link')
            .contains('Forgot your password?')
            .click()
         cy.url()
            .should('include', '/reset')
        cy.contains('Restore password')

        cy.visit('/login')

        cy.get('.btn-secondary')
            .contains('Create account')
            .click()
        cy.url()
            .should('include', '/signup')
    })

    it('testing the login with username', function () {


        cy.server()
        cy.route({
            url: 'http://localhost:8080/auth/login/user1',
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: "1234",
            response: "asdfghj"
        })
    })

    it('testing login with e-mail', function () {    
        cy.server()
        cy.route({
            url: 'http://localhost:8080/auth/login/mario@usi.ch',
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: "1234",
            response: "asdfghj"
        })
    })
})