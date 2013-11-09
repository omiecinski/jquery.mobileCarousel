# jquery.mobileCarousel

A robust, yet simple jQuery plugin for adding swipe-enabled interactive carousels to sites.


### Features

* Supports touch events and falls back to click on desktop
* Does not modify the DOM unless the carousel counter option is enabled, which simply adds an unordered list for tracking the current slide
* Leverages CSS3 animations for better mobile performance
* Autoplay and no-repeat options


### Options (and defaults)

	counter: false,
(boolean) Enable the carousel counter. Automatically creates nodes for each carousel slide.
	
	counterClass: "indicator",
(string) CSS class assigned to the counter. If a sibling of the carousel element matches the class provided, it will be used instead of creating a new counter. Useful for moving the order of the counter in relationship to the carousel, supplying additional properties to the counter, or using a non-unordered list element as the counter. If no match is found, the class will be added to the new counter.

	counterId: "",
(string) If an ID is supplied and an element with the ID exists, it will be used as the carousel counter. 
	
	startSlide: 0,
(int) Initial slide to show on load.	
	
	exclude: "",
(string) Specify elements within the carousel that should not be treated as slides. Accepts valid CSS selectors (do not negate the selector as it is already inserted into a ":not()" selection).
	
	autoChange: false,
(boolean) Automatically change slides without requiring user interaction.
	
	autoDelay: 0,
(float) Delay before the autoChange takes effect. Specified in seconds.	
	
	autoInterval: 3,
(float) Delay for the autoChange. Specified in seconds.	
	
	swipe: false,
(boolean) Support swipe actions.	
	
	oneway: false,
(boolean) Enable the carousel to stop at the first and last slide, rather than repeat infinitely.	
	
	fixedHeight: true,
(boolean) If set to true, the plugin assumes a height is specified for the carousel and all content within the carousel is the same height. If set to false, the plugin will dynamically adjust the height of the carousel based on the height of the current slide.
	
	minSwipeDistance: 30
(float) Distance a touch move must travel before being counted as a swipe on the carousel.

	animationClass: "animateLeft"
(string) CSS class containing animation properties.


### Examples

Standard usage:

	$("#myCarousel").carousel();
	
Standard usage with options:

	$("#myCarousel").carousel({swipe: true, counter: true});
    

### Plugin methods

####change
Animate to a desired slide. Accepts an object specifying the destination slide. The destination slide can be specified in a number of ways:

	{ el: (DOM element) }
Provide the node in the carousel you wish to animate to.
	
	{ direction: (int) }
Provide the difference between the destination slide index and the current slide index. For example, the next slide would be { direction: 1 } and the previous slide would be { direction: -1 }.
	
	{ slide: (int) }
Provide the destination slide index.

####skipTo
Switch to a desired slide without animation. Accepts an object specifying the destination slide. See change method above for object syntax.

	
### Additional usage ideas

Enable the default carousel indicators to change the carousel to the represented slide

	$(".indicator").on("click", "li", function(){
		$("#myCarousel").carousel("change", {slide: $(this).index()});
	});
	
	
### Notes

See jquery.mobileCarousel.css for basic carousel styles required for correct functionality.


### Requires

* jQuery 1.7+