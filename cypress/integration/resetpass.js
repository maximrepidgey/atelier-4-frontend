/// <reference types="cypress" />

describe('test the reset password', function () {
    it('testing all the buttons', function () {  
   
   cy.visit('/reset')   

   cy.get('.btn-secondary')
        .contains('Cancel')
        .click()
    cy.url()
        .should('include', '/login')
    
    cy.visit('/reset')   

    })

    it('testing the request', function () {  
   
        cy.visit('/reset')  
        cy.server() 

        cy.route({
            url: 'http://localhost:8080/auth/reset/mario@usi.ch',
            method: "POST",
            status: 204,
            response: {}
        })
     })
})   