(function($){
    var settings = {
      counter: false,
      counterClass: "indicator",
      counterId: "",
      startSlide: 0,
      exclude: "",
      autoChange: false,
      autoDelay: 0,
      autoInterval: 3,
      swipe: false,
      oneway: false,
      fixedHeight: true,
      minSwipeDistance: 30,
      animationClass: "animateLeft"
    },
    
    transitionEnd = function(){
      var t = ["transitionend", "oTransitionEnd", "webkitTransitionEnd"], i, l = t.length;
      
      for(i = 0; i < l; i++){
        if("on"+t[i].toLowerCase() in window === true){
          return t[i];
        }
      }
      // Firefox 14 is incorrectly returning false for "ontransitionend" support
      if(window.navigator.userAgent.match(/Firefox/i) !== null){
        return t[0];
      }
      return false;
    }(),
    
    
    // PRIVATE METHODS
    getSwipeDirection = function(swipeStart, swipeEnd, minSwipeDistance){
      var x = swipeStart[0] - swipeEnd[0],
        y = swipeStart[1] - swipeEnd[1];
        
      if(typeof minSwipeDistance === "undefined"){
        minSwipeDistance = settings.minSwipeDistance;
      }

      if(Math.abs(x) > Math.abs(y) && Math.abs(x) > minSwipeDistance){
        return x<0?-1:1;
      }
      return 0;
    },
    
    getTargetIndex = function(target, el){
      var tIndex = -1,
        lastIndex = el.carousel.slides.length - 1,
        _settings = el.carousel.settings;
      
      if(typeof target.el !== "undefined" && target.el.length !== 0){
        tIndex = el.carousel.slides.index(target.el);
        return tIndex;
      } else if(typeof target.direction !== "undefined"){
        tIndex = el.carousel.currentSlide + parseInt(target.direction, 10);
      } else if(typeof target.slide !== "undefined"){
        tIndex = parseInt(target.slide, 10);
      }
      
      // make sure tIndex is a valid slide
      if(_settings.oneway === true && (tIndex > lastIndex || tIndex < 0)){
        tIndex = el.carousel.currentSlide;
      } else {
        tIndex = tIndex > lastIndex?0:tIndex < 0?lastIndex:tIndex;
      }
      
      return tIndex;
    },
    
    isValidSlide = function(targetIndex, carousel){
      if(targetIndex < 0 || targetIndex > carousel.slides.length - 1 || targetIndex === carousel.currentSlide){
        return false;
      }
      return true;
    },

    startAutoChange = function(el){
      clearInterval(el.carousel.data.autoChangeInt);
      el.carousel.data.autoChangeInt = setInterval(function(){
        $(el).carousel("change",{direction: 1});
      }, el.carousel.settings.autoInterval*1000);
    },
    
    initSwipe = function(el){
      var $el = el.carousel.$el;
      
      if('ontouchstart' in window){
        $el.on("touchstart",function(e){
          e = e.originalEvent;
          el.carousel.data.swipeStart = [e.touches[0].pageX,e.touches[0].pageY];
          el.carousel.data.swipeEnd = [];
        }).on("touchmove",function(e){
          if(el.carousel.data.swipeStart.length === 0){
            e.preventDefault();
            return;
          }
          
          e = e.originalEvent;
          el.carousel.data.swipeEnd = [e.touches[0].pageX,e.touches[0].pageY];
          
          var direction = getSwipeDirection(el.carousel.data.swipeStart, el.carousel.data.swipeEnd, el.carousel.settings.minSwipeDistance);
          console.log(direction);
          
          if(direction !== 0){
            $el.carousel("change", {direction: direction});
            // android suppresses our action until the user scrolls the page if we preventDefault here
            if(navigator.userAgent.match(/android/i) == null){
              e.preventDefault();
            }
            // clear swipeStart so touchmove won't fire multiple carousel.change events
            el.carousel.data.swipeStart = [];
          }
        }).on("touchend",function(e){
          if(el.carousel.data.swipeEnd.length !== 0){
            e.preventDefault();
            el.carousel.data.swipeEnd = [];
          }
        });
      } else {
        // fallback for non-touch phones (i.e. blackberry)
        $el.on("click", function(e){
          $el.carousel("change", {direction: 1});
        });
      }
    },
    
    // add 'active' class to correct slide indicator
    updateCounter = function(counter, i){
      if(typeof counter !== "undefined" && counter.length !== 0){
        i++;
        counter.children(".active").removeClass("active");
        counter.children(":nth-child("+ i +")").addClass("active");
      }
    },
    
    
    // PUBLIC METHODS
    methods = {
      init: function(o){
				if(typeof o === "undefined"){
					o = {};
				}
			
				if(typeof o.exclude !== "undefined" && o.exclude !== ""){
					o.exclude = ":not("+o.exclude+")";
				}
        return this.each(function() {
          var $el = $(this),
            self = this,
            _settings;
          
          _settings = $.extend({}, settings, o);
          
          this.carousel = {
            $el: $el,
            settings: _settings,
            slides: $el.children(_settings.exclude),
            currentSlide: 0,
            autoChangeInt: 0,
            data: {}
          };

          // ADD ADDITIONAL PUBLIC METHODS (not accessible through jQuery plugin syntax - might move later)
          // return current slide element
          this.getSlide = function(i){
            i = typeof i !== "undefined"?i:this.carousel.currentSlide;
            return this.carousel.slides[i];
          };

          
          // INITIALIZE OPTIONS
          // move to startSlide if not zero
          if(_settings.startSlide !== 0){
            if(isValidSlide(_settings.startSlide, this.carousel) === true){
              $el.carousel("skipTo", {slide: _settings.startSlide});
            }
          }
          
          // start auto-change sequence with specified delay
          if(_settings.autoChange === true){
            if(isNaN(_settings.autoDelay) === true){
              _settings.autoDelay = 0;
            }
            
            setTimeout(function(){
              startAutoChange(self);
            }, _settings.autoDelay * 1000);
          }

          // enable swiping to change slides
          if(_settings.swipe === true){
            this.carousel.data.swipeStart = this.carousel.data.swipeEnd = [];
            initSwipe(this);
          }
          
          // set variable container height
          if(_settings.fixedHeight === false){
            $el.css({height: this.carousel.slides.eq([this.carousel.currentSlide]).outerHeight(true) + "px"});
          }


          // create counter indicators for each slide
          //  - to use a counter that already exists anywhere in the DOM, specify a counterId in the options
          //  - also checks if the carousel already has a sibling with the specified counterClass;
          //    useful for situtations where the counter container needs additional properties
          //    or you wish to have the counter container as a non-UL element
          if(_settings.counter === true){
            var counter, 
              dots = [], dot, 
              i, l = this.carousel.slides.length,
              isList = false;
            
            // if passed an ID for the counter, see if the element exists
            if(_settings.counterId !== "" && document.getElementById(_settings.counterId) !== null){
              counter = $("#" + _settings.counterId);
            } else {
              counter = $el.siblings("." + _settings.counterClass);
              
              // check if an element with the counter class is already a sibling of the carousel
              // if not, create a new list to store the counter indicators
              if(counter.length === 0){
                counter = document.createElement("ul");
                counter.className = _settings.counterClass;
                counter = $(counter);
                $el.after(counter);
              }
            }

            if(counter.prop("nodeName").toLowerCase() === "ul"){
              isList = true;
            }
            
            for(i = 0; i < l; i++){
              dot = document.createElement(isList === true?"li":"span");
              if(this.carousel.currentSlide === i){
                dot.className = "active";
              }
              dots.push(dot);
            }
            counter.append(dots);
            this.carousel.counter = counter;
          }

        });
      },

      change: function(target){
        return this.each(function(){
          var $el = this.carousel.$el,
            _settings = this.carousel.settings,
            _slides = this.carousel.slides,
            to,
            from = _slides.eq(this.carousel.currentSlide),
            targetIndex = getTargetIndex(target, this),
            direction = targetIndex > this.carousel.currentSlide?1:-1,
            self = this;

          // abort if the target Slide index is less than 0, greater than the amount of slides, or equal to the current slide
          if(isValidSlide(targetIndex, this.carousel) === false){
            return
          }

          to = _slides.eq(targetIndex);
          
          // if the target specifies a direction, overwrite the default logic and use it
          // important for looping from the last to first slide
          if(typeof target.direction !== "undefined"){
            direction = target.direction;
          }

          // only transition the elements if the carousel is visible
          if(this.clientHeight !== 0 && this.clientWidth !== 0){
            to.css({left: (100 * direction) + "%"});

            setTimeout(function(){
              var cleanup = function(e){
                to.add(from).removeClass(_settings.animationClass);

                if(_settings.fixedHeight === false){
                  $el.css({height: to.outerHeight(true) + "px"});
                }

                e.currentTarget.removeEventListener(transitionEnd, cleanup, false);
              };

							if(transitionEnd !== false){
								to.add(from).addClass(_settings.animationClass);
								
								from.css({left: (-100 * direction) + "%"});
								to.css({left: 0}).get(0).addEventListener(transitionEnd, cleanup, false);
              } else {
								from.animate({left: (-100 * direction) + "%"});
								to.animate({left: 0}, function(){
									$el.animate({height: to.outerHeight(true) + "px"});
								});
              }
            },50);

            // trigger a custom event to indicate the carousel changed; useful for custom callbacks
            $el.trigger("carousel.change", [this.carousel.currentSlide, targetIndex]);
            
            this.carousel.currentSlide = targetIndex;
            updateCounter(this.carousel.counter, targetIndex);
          }

          // reset auto changer
          if(_settings.autoChange === true){
            startAutoChange(this);
          }
        });
      },
      
      skipTo: function(target){
        return this.each(function() {
          var $el = this.carousel.$el,
            _settings = this.carousel.settings,
            _slides = this.carousel.slides,
            targetIndex = getTargetIndex(target, this),
            h;

          // abort if the target Slide index is less than 0, greater than the amount of slides, or equal to the current slide
          if(isValidSlide(targetIndex, this.carousel) === false){
            return
          }

          // update previous slide
          _slides.eq(this.carousel.currentSlide).css({left: "100%"});
          // update target slide
          targetSlide = _slides.eq(targetIndex).css({left: 0});
          
          if(_settings.fixedHeight === false){
            $el.css({height: targetSlide.outerHeight(true) + "px"});
          }
          
          // trigger a custom event to indicate the carousel changed; useful for custom callbacks
          $el.trigger("carousel.skip", [this.carousel.currentSlide, targetIndex]);
          
          this.carousel.currentSlide = targetIndex;
          updateCounter(this.carousel.counter, targetIndex);
          
          // reset auto changer
          if(_settings.autoChange){
            startAutoChange(this);
          }
        });
      }
    };
    
  $.fn.carousel = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    }
  };
})( jQuery );
