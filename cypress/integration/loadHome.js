/// <reference types="cypress" />

describe('Test the homepage', function () {
    it('testing all the buttons', function () {

        cy.visit('/')
        cy.contains('SmartHut')
         
        cy.get('.btn-homepage-headline')
            .contains('Join now')
            .click()
        cy.url()
            .should('include', '/signup')

        cy.visit('/')
        cy.get('.join-now')
            .contains('Join now')
            .click()
        cy.url()
            .should('include', '/signup')
        cy.visit('/')

    })
})