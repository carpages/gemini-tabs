/**
 * @fileoverview

A jQuery plugin for tabs.

### Notes
- Here's a note

### Features
- Here's a feature

 *
 * @namespace jquery.tabs
 * @copyright Carpages.ca 2014
 * @author Matt Rose <matt@mattrose.ca>
 *
 * @requires jquery
 * @requires jquery.boiler
 *
 * @prop {boolean} hash {@link jquery.tabs#hash}
 * @prop {function} onChange {@link jquery.tabs#onChange}
 * @prop {string} tabState {@link jquery.tabs#tabState}
 * @prop {string} targetState {@link jquery.tabs#targetState}
 * @prop {boolean} responsive {@link jquery.tabs#responsive}
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
  $('#js-tabs').tabs();
 */
define(['jquery-loader', 'underscore', 'jquery.boiler', 'jquery.respond'], function($, _){

  $.boiler('tabs', {
    defaults: {
      /**
       * Whether to use hash's in the url to control the tab
       *
       * @name jquery.tabs#hash
       * @type boolean
       * @default false
       */
      hash: false,
      /**
       * The callback to run when the tab changes
       *
       * @name jquery.tabs#onChange
       * @type function
       * @default false
       */
      onChange: false,
      /**
       * The state to add to the active tab link
       *
       * @name jquery.tabs#tabState
       * @type string
       * @default 'is-active'
       */
      tabState: 'is-active',
      /**
       * The state to add to the active tab
       *
       * @name jquery.tabs#targetState
       * @type string
       * @default 'is-active'
       */
      targetState: 'is-active',
      /**
       * Whether to change to a select dropdown on small screens
       *
       * *Note:* This adds ``select.select--tab`` to the select container
       *
       * @name jquery.tabs#responsive
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

    init: function(){
      var plugin = this;

      //Cache anchors
      plugin.$anchors = plugin.$el.find('a');

      //Cache tabs
      plugin.$anchors.each(function(){

        var $this = $(this),
          target = $this.attr('href');

        plugin.tabs[target] = {
          $tab: $this,
          $target: $(target)
        };
      });

      //Bind click events
      plugin.$el.on('click', 'a', function(e){
        e.preventDefault();

        var target = $(this).attr('href');
        plugin.open(target);
      });

      //Find the currently active anchor based on markup
      var active = $(
        plugin.$anchors.filter('.' + plugin.settings.tabState)[0] ||
        plugin.$anchors[0]
      ).attr('href');

      //Activate hashed tab
      if(plugin.settings.hash && _.has(plugin.tabs, window.location.hash)){
        plugin._deactivate(active);
        active = window.location.hash;
      }

      //Activate the current item and the content
      plugin.open(active);

      //Initiate responsiveness
      if(plugin.settings.responsive) plugin._responsiveInit();
    },

    /**
     * Builds a select box out of the list of anchors
     *
     * @private
     * @method
     * @name jquery.tabs#_getSelect
     * @return {element} Returns a jQuery element
    **/
    _getSelect: function(){
      var plugin = this;

      var $select = $('<select/>');

      _.each(plugin.tabs, function(tab, target){
        $select.append(
          $('<option />')
            .val(target)
            .text(tab.$tab.text())
            .prop('selected', tab.$tab.hasClass(plugin.settings.tabState))
        );
      });

      return $select.wrap('<div class="select select--tab"/>')
                    .parent()
                    .wrap('<div class="w-select--tab"/>')
                    .parent();
    },

    /**
     * Initiates the responsiveness
     *
     * @private
     * @method
     * @name jquery.tabs#_responsiveInit
    **/
    _responsiveInit: function(){
      var plugin = this;

      // Build fallback select
      plugin.$select = plugin._getSelect();

      // Add wrapper
      plugin.$wrapper = plugin.$el.wrap('<span/>').parent();

      // Add select box
      plugin.$wrapper.append(plugin.$select);

      // Add event to change tabs
      plugin.$select.find('select').on('change', function(){
        plugin.open($(this).val());
      });

      var adjustTabs = function(screen){
        if(screen == 'small'){
          plugin.$select.show();
          plugin.$el.hide();
        }else{
          plugin.$el.show();
          plugin.$select.hide();
        }
      };

      // Init
      adjustTabs($.respond.screen);

      // Add listener
      $.respond.bind('resize', function(e, screen){
        adjustTabs(screen);
      });
    },

    /**
     * Open a tab
     *
     * @method
     * @name jquery.tabs#open
     * @param {string} target The id of the tab (``#example``)
    **/
    open: function(target){
      var plugin = this;

      if (plugin.settings.hash) window.location.hash = target;

      if(target!=plugin.active && _.has(plugin.tabs, target)){
        plugin._deactivate(plugin.active);
        plugin._activate(target);
      }
    },

    /**
     * Activate a tab
     *
     * @private
     * @method
     * @name jquery.tabs#_activate
     * @param {string} target The id of the tab
    **/
    _activate: function(target){
      var plugin = this;

      if(_.has(plugin.tabs, target)){
        plugin.tabs[target].$tab.addClass(plugin.settings.tabState);
        plugin.tabs[target].$target.addClass(plugin.settings.targetState);
        plugin.tabs[target].$target.show();
        plugin.active = target;

        if(plugin.settings.onChange) plugin.settings.onChange.call(plugin);
      }
    },

    /**
     * Deactivate a tab
     *
     * @private
     * @method
     * @name jquery.tabs#_deactivate
     * @param {string} target The id of the tab
    **/
    _deactivate: function(target){
      var plugin = this;

      if(_.has(plugin.tabs, target)){
        plugin.tabs[target].$tab.removeClass(plugin.settings.tabState);
        plugin.tabs[target].$target.removeClass(plugin.settings.targetState);
        plugin.tabs[target].$target.hide();
      }
    }
  });

  // Return the jquery object
  // This way you don't need to require both jquery and the plugin
  return $;

});
