(function(window){

    if (typeof String.prototype.endsWith !== 'function') {
      String.prototype.endsWith = function(suffix) {
          return this.indexOf(suffix, this.length - suffix.length) !== -1;
      };
    }

    var mapper = {};
    $(document).ready(function(){

        // load the world map
        mapper.map = new jvm.Map({
            container:$('#world-map'),
            map:'world_mill',
            markerStyle: {
              initial: {
                fill: '#F8E23B',
                stroke: '#383f47',
              },
              selected: {
                  fill: 'orange',
              },
            },
            onMarkerClick: function(e, id) {
              mapper.clicked(id);
            },
        });

        mapper.show = function(data) {
            var id = data.id;
            var name = data.loan.name+' from '+data.loan.location.country;
            var geo = data.loan.location.geo.pairs.split(' ');
            var coords = [Number(geo[0]), Number(geo[1])];
            mapper.map.addMarker(id, {name: name, latLng: coords});
        }

        mapper.select = function(id) {
            mapper.hilite(id);
            mapper.map.clearSelectedMarkers();
            mapper.map.setSelectedMarkers(id);
        }

        mapper.clicked = function(id) {
            mapper.scrollTo(id);
            mapper.select(id);
        }

        mapper.hilite = function(id) {
            // reset previous hilites
            var $container = $('#messages');
            $container.find('div').css('color','inherit');
            // hilite the item
            var $item = $('#lines').find('div[data-id="'+id+'"]');
            $item.css('color','red');
        }

        mapper.scrollTo = function(id) {
            var $container = $('#messages');
            // reset previous hilites
            $container.find('div').css('color','inherit');
            var $item = $('#lines').find('div[data-id="'+id+'"]');
            // scroll to the item
            $container.animate({
                scrollTop: $item.offset().top - $container.offset().top + $container.scrollTop()
            }, 100);
        }

        // show marker on map when clicked on a loan item
        $('#lines').on('click', 'div[data-id]', function(){
            mapper.select($(this).attr('data-id'));
        });

        checkNews(mapper);
    });

    /** gets the next available news item
    */
    var kn = new Kivanews();
    var checkNews = function(){
        kn.check()
        .then(data => {
            if (data) {
                message('', format_html(data));
                mapper.show(data);
            }
            setTimeout(function(){
                checkNews();
            }, 5000);
        })
        .catch(err => {
            console.log(err);
        })
    }

    function format_html(data) {
        var d = data;
        var dt = '<span class="datetime">' + (new Date(d.date).toLocaleString("en-GB")) + '</span>';
        var lender = '<a href="http://www.kiva.org/lender/' + d.lender.uid + '">' + d.lender.name + '</a>';
        var from_loc = ' ' + (d.lender.whereabouts ? ' from ' + d.lender.whereabouts : '');
        var amount = (d.loan.basket_amount & d.loan.basket_amount > 0) ?
            '$' + d.loan.basket_amount : 'an undisclosed amount';
        var to_loaner = ' to <a href="http://www.kiva.org/lend/'+ d.loan.id + '">' + d.loan.name + '</a>';
        var for_use = ' ' + d.loan.use.trim();
        if (!for_use.endsWith('.')){
            for_use += '.';
        }
        var to_go = ' <em>$' + (d.loan.loan_amount - d.loan.funded_amount) + '</em> to go!';
        if (d.status == 'funded') {
            to_go = ' <em>Fully funded!</em>';
        }
        var tags = '';
        for(t in d.loan.tags) {
            if (d.loan.tags[t].name[0] == '#'){
                tags += ' ' + d.loan.tags[t].name;
            }
        }
        return '<div data-id="'+data.id+'">' + dt + lender + from_loc + ' loaned ' + amount + to_loaner + ' from ' + d.loan.location.country +
            for_use + to_go + tags + '</div>';
    };

    function message(from, msg) {
        var line = msg;
        $('#lines').prepend('<p>'+line+'</p>');
    }

})(window);