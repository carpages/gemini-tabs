/**
 * @fileoverview

A Gemini plugin for tabs.

 *
 * @namespace gemini.tabs
 * @copyright Carpages.ca 2014
 * @author Matt Rose <matt@mattrose.ca>
 *
 * @requires gemini
 * @requires gemini.respond
 *
 * @prop {boolean} hash {@link gemini.tabs#hash}
 * @prop {function} onChange {@link gemini.tabs#onChange}
 * @prop {string} tabState {@link gemini.tabs#tabState}
 * @prop {string} targetState {@link gemini.tabs#targetState}
 * @prop {boolean} responsive {@link gemini.tabs#responsive}
 *
 * @example
  <html>
    <div id="js-tabs">
      <a href="#tab-1">Tab 1</a>
      <a href="#tab-2">Tab 2</a>
    </div>
    <div id="tab-1" class="tab">
      This is Tab 1!
    </div>
    <div id="tab-2" class="tab">
      This is Tab 2!
    </div>
  </html>
 *
 * @example
  G('#js-tabs').tabs();
 */

( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([
      'gemini',
      'gemini.respond'
    ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory(
      require( 'gemini-loader' ),
      require( 'gemini.respond' )
    );
  } else {
    // Browser globals
    factory( G );
  }
}( function( $ ) {
  var _ = $._;

  $.boiler( 'tabs', {
    defaults: {
      /**
       * Whether to use hash's in the url to control the tab
       *
       * @name gemini.tabs#hash
       * @type boolean
       * @default false
       */
      hash: false,

      /**
       * The callback to run when the tab changes
       *
       * @name gemini.tabs#onChange
       * @type function
       * @default false
       */
      onChange: false,

      /**
       * The state to add to the active tab link
       *
       * @name gemini.tabs#tabState
       * @type string
       * @default 'is-active'
       */
      tabState: 'is-active',

      /**
       * The state to add to the active tab
       *
       * @name gemini.tabs#targetState
       * @type string
       * @default 'is-active'
       */
      targetState: 'is-active',

      /**
       * Whether to change to a select dropdown on small screens
       *
       * *Note:* This adds ``select.select--tab`` to the select container
       *
       * @name gemini.tabs#responsive
       * @type boolean
       * @default false
       */
      responsive: false
    },

    /*
     * This will store all of the tabs
     * {'#target': {
     *  $tab: $Object,
     *  $target: $Object
     * }}
     */
    tabs: {},

    active: '',

    init: function() {
      var plugin = this;

      // Cache anchors
      plugin.$anchors = plugin.$el.find( 'a' );

      // Cache tabs
      plugin.$anchors.each( function() {
        var $this = $( this );
        var target = $this.attr( 'href' );

        plugin.tabs[target] = {
          $tab:    $this,
          $target: $( target )
        };
      });

      // Initiate responsiveness
      if ( plugin.settings.responsive ) plugin._responsiveInit();

      // Bind click events
      plugin.$el.on( 'click', 'a', function( e ) {
        e.preventDefault();

        var target = $( this ).attr( 'href' );
        plugin.open( target );
      });

      // Find the currently active anchor based on markup
      var active = $(
        plugin.$anchors.filter( '.' + plugin.settings.tabState )[0] ||
        plugin.$anchors[0]
      ).attr( 'href' );

      // Activate hashed tab
      if ( _.has( plugin.tabs, window.location.hash )) {
        plugin._deactivate( active );
        active = window.location.hash;
      }

      // Activate the current item and the content
      plugin.open( active );
    },

    /**
     * Builds a select box out of the list of anchors
     *
     * @private
     * @method
     * @name gemini.tabs#_getSelect
     * @return {element} Returns a jQuery element
    **/
    _getSelect: function() {
      var plugin = this;

      var $select = $( '<select/>' );

      _.each( plugin.tabs, function( tab, target ) {
        // Create text (remove a11y)
        var text = tab.$tab.clone().find( '.a11y' ).remove().end().text();

        $select.append(
          $( '<option />' )
            .val( target )
            .text( text )
            .prop( 'selected', tab.$tab.hasClass( plugin.settings.tabState ))
        );
      });

      return $select.wrap( '<div class="select select--tab"/>' )
                    .parent()
                    .wrap( '<div class="w-select--tab"/>' )
                    .parent();
    },

    /**
     * Initiates the responsiveness
     *
     * @private
     * @method
     * @name gemini.tabs#_responsiveInit
    **/
    _responsiveInit: function() {
      var plugin = this;

      // Build fallback select
      plugin.$select = plugin._getSelect();

      // Add wrapper
      plugin.$wrapper = plugin.$el.wrap( '<span/>' ).parent();

      // Add select box
      plugin.$wrapper.append( plugin.$select );

      // Add event to change tabs
      plugin.$select.find( 'select' ).on( 'change', function() {
        plugin.open( $( this ).val());
      });

      var adjustTabs = function( screen ) {
        if ( screen === 'small' ) {
          plugin.$select.show();
          plugin.$el.hide();
        } else {
          plugin.$el.show();
          plugin.$select.hide();
        }
      };

      // Init
      adjustTabs( $.respond.getScreen());

      // Add listener
      $.respond.bind( 'resize', function( e, screen ) {
        adjustTabs( screen );
      });
    },

    /**
     * Open a tab
     *
     * @method
     * @name gemini.tabs#open
     * @param {string} target The id of the tab (``#example``)
    **/
    open: function( target ) {
      var plugin = this;

      if ( target !== plugin.active && _.has( plugin.tabs, target )) {
        plugin._deactivate( plugin.active );
        plugin._activate( target );
      }
    },

    /**
     * Activate a tab
     *
     * @private
     * @method
     * @name gemini.tabs#_activate
     * @param {string} target The id of the tab
    **/
    _activate: function( target ) {
      var plugin = this;

      if ( _.has( plugin.tabs, target )) {
        var tab = plugin.tabs[target];

        tab.$tab.addClass( plugin.settings.tabState );
        tab.$target.addClass( plugin.settings.targetState );
        tab.$target.show();
        plugin.active = target;

        if ( plugin.settings.hash ) {
          // Ensure that the browser doesn't scroll to the hash
          tab.$target.attr( 'id', '' );
          window.location.hash = target;
          tab.$target.attr( 'id', target.substring( 1 ));
        }

        if ( plugin.settings.responsive ) {
          plugin.$select.find( 'select' ).val( target );
        }

        if ( plugin.settings.onChange ) {
          plugin.settings.onChange.call( plugin );
        }
      }
    },

    /**
     * Deactivate a tab
     *
     * @private
     * @method
     * @name gemini.tabs#_deactivate
     * @param {string} target The id of the tab
    **/
    _deactivate: function( target ) {
      var plugin = this;

      if ( _.has( plugin.tabs, target )) {
        plugin.tabs[target].$tab.removeClass( plugin.settings.tabState );
        plugin.tabs[target].$target.removeClass( plugin.settings.targetState );
        plugin.tabs[target].$target.hide();
      }
    }
  });

  // Return the jquery object
  // This way you don't need to require both jquery and the plugin
  return $;
}));
