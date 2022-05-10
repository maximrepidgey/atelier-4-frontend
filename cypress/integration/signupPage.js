/// <reference types="cypress" />

describe('test the signup page', function () {
    it('testing the buttons', function () {  
        cy.visit('/signup')
        
        cy.get('.btn-secondary')
        .contains('Sign in')
        .click()
    cy.url()
        .should('include', '/login')
       
     })
     it('testing the request', function () {  
        cy.visit('/signup')
        
        cy.server()
        cy.route({
            url: 'http://localhost:8080/user/user2',
            method: 'POST',
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify(
                {
                    username: 'user2',
                    email: 'user2@a.com',
                    fullname: 'user 2',
                    password: '12345'
                }),
            response: "fixture:usersTest.json"
        })
      
    })
 })
    



