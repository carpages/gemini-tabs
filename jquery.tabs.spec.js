define(['./jquery.tabs'], function ($) {

	/*
	 * TESTS
	 */

	describe("tabs", function(){

		beforeEach(function(){
			//Setup required dom elements
			$container = $('<div>', {id:'container'});
			$tabs = $('<ul>', {id:'tabs'});

			$anchor1 = $('<a>', {href:'#tab1'});
			$anchor2 = $('<a>', {href:'#tab2'});
			$anchor3 = $('<a>', {href:'#tab3'});

			$content1 = $('<div>', {id:'tab1'});
			$content2 = $('<div>', {id:'tab2'});
			$content3 = $('<div>', {id:'tab3'});

			$tabs.append([
				$('<li>').append($anchor1),
				$('<li>').append($anchor2),
				$('<li>').append($anchor3)
			]);

			$container.append([
				$tabs,
				$content1,
				$content2,
				$content3
			]);

			setFixtures($container);
		});

		it("should add the class 'is-active' to first tab and content if not already set", function(){
			$('#tabs').tabs();

			expect($anchor1).toHaveClass('is-active');
			expect($content1).toHaveClass('is-active');
		});

		it("should leave the class 'is-active' if already set on the anchor", function(){
			$anchor2.addClass('is-active');

			$('#tabs').tabs();

			expect($anchor1).not.toHaveClass('is-active');
			expect($anchor2).toHaveClass('is-active');
			expect($content2).toHaveClass('is-active');
		});

		it("should add the class 'is-active' on the tab and content when clicked", function(){
			$('#tabs').tabs();

			$anchor2.click();

			expect($anchor2).toHaveClass('is-active');
			expect($content2).toHaveClass('is-active');
		});

		it("should remove the class 'is-active' on the tab and content when new tab is clicked", function(){
			$('#tabs').tabs();

			$anchor2.click();

			expect($anchor1).not.toHaveClass('is-active');
			expect($content1).not.toHaveClass('is-active');
		});

	});

});