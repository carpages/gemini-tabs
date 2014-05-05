define(['jquery.boiler', 'underscore', 'jquery.respond'], function($, _){

  $.boiler('tabs', {
    defaults: {
      hash: false,
      onChange: false,
      tabState: 'is-active',
      targetState: 'is-active',
      responsive: false
    },

    /* This will store all of the tabs
     * {'#target': {
     *  $tab: $Object,
     *  $target: $Object
     * }}*/
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

    // This builds a select box out of the list of anchors
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

    // Initiate responsiveness
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

    open: function(target){
      var plugin = this;

      if (plugin.settings.hash) window.location.hash = target;

      if(target!=plugin.active && _.has(plugin.tabs, target)){
        plugin._deactivate(plugin.active);
        plugin._activate(target);
      }
    },

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
