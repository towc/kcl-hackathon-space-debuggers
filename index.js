var c = document.getElementById( 'game' ),
    w = c.width = 400,
    h = c.height = 600,
    ctx = c.getContext( '2d' ),
   
    opts = {

        bugs: [ 'funciton(){}', '{];', '[};' , '{a=b;};', '[1;2,3];', 'c=#f00;' ],
        nonBugs: [ 'function(){}', '{};', '[];', '{a:b};', '[1,2,3];', 'c="#f00";' ],
       
        cellWidth: 10,
        cellHeight: 10,
        font: '10px monospace',

        templateRepaint: 'rgba(0,0,0,alp)',
        bugColor: '#f00',
        nonBugColor: '#3f3',
        invalidColor: '#888',
        playerText: [ 'try{', '}catch(', '){', '}' ],
        playerColors: [ 'blue', 'red', 'blue', 'violet', 'blue', 'green', 'blue' ],
        playerBullet: 'e',

        leftKeys: [ 37, 65, 72 ],
        rightKeys: [ 39, 68, 76 ],
        shootKeys: [ 32, 38, 40, 87, 83, 74, 75 ]
    },
    calc = {
       
        width: w / opts.cellWidth |0,
        height: h / opts.cellHeight |0,
    },

    player, level, entities = [], powerups = [
       
        function(){
           
            player.ticksParBullet = ( player.ticksParBullet - 1 ) * .8;

            msgEl.textContent = 'fire rate sped up';
        },
        function(){
           
            player.bulletSpeed += .1;
            msgEl.textContent = 'increased bullet speed';
        },
        function(){
           
            ++player.lives;

            msgEl.textContent = 'added lives';
        },
        function(){
           
            player.ticksParMove = ( player.ticksParMove - 1 ) * .8;

            msgEl.textContent = 'player sped up';
        }
    ];
 
function init(){
 
    for( var i = 0; i < opts.bugs.length; ++i ){
       
        opts.bugs[ i ] = opts.bugs[ i ].split('').reverse().join('');
        opts.nonBugs[ i ] = opts.nonBugs[ i ].split('').reverse().join('');
    }
   
    ctx.font = opts.font;
    reset();
 
    anim();
 
}
function reset(){
   
    resetPlayer();
    resetLevel();
 
    entities.length = 0;
 
    ctx.fillStyle = opts.templateRepaint.replace( 'alp', 1 );
}
function resetPlayer(){
 
    player = {
       
        tick: 0,
        text: opts.playerText.join( '' ),
        x: 0,
        y: calc.height - 3,
        sizes: [ 2, 2 ],
        pos: [ 0, 0, 0, 0, 0, 0 ],
        widths:  [],
        bullets: [ ],
        ticksParBullet: 10,
        bulletSpeed: .3,
        ticksParMove: 4,
        level: 1,
        lives: 3,
 
        entitiesKilled: 0,
 
        dir: 1,
        lastMoveTick: 0,
        lastBulletTick: 0,
 
        bulletX: 0,
 
        moveDown: false,
        shootDown: false,
       
        loseLife: function(){
           
            --player.lives;
        }
    };
 
    updatePlayerPositions();
}
function resetLevel(){
 
    level = {
       
        bugs: player.level * 5 |0,
 
        lastSpawn: 0,
        spawnInterval: 80,
        entitySpeed: player.level * .1
    }
}
 
function updatePlayerPositions(){
   
    player.pos[ 0 ] = player.x;
    player.widths[ 0 ] = opts.playerText[ 0 ].length;
 
    player.pos[ 1 ] = player.pos[ 0 ] + player.widths[ 0 ];
    player.widths[ 1 ] = player.sizes[ 0 ];
 
    player.pos[ 2 ] = player.pos[ 1 ] + player.widths[ 1 ];
    player.widths[ 2 ] = opts.playerText[ 1 ].length;
 
    player.pos[ 3 ] = player.bulletX = player.pos[ 2 ] + player.widths[ 2 ];
    player.widths[ 3 ] = 1;
    player.bulletX %= calc.width;
   
    player.pos[ 4 ] = player.pos[ 3 ] + 1;
    player.widths[ 4 ] = opts.playerText[ 2 ].length;
 
    player.pos[ 5 ] = player.pos[ 4 ] + player.widths[ 4 ];
    player.widths[ 5 ] = player.sizes[ 1 ];
 
    player.pos[ 6 ] = player.pos[ 5 ] + player.widths[ 5 ];
    player.widths[ 6 ] = opts.playerText[ 3 ].length;
 
    for( var i = 0; i < 6; ++i )
        player.pos[ i ] %= calc.width;
}
 
function anim(){
   
    window.requestAnimationFrame( anim );
 
    ++player.tick;
 
    scoreEl.innerText = '' + player.entitiesKilled;
    levelEl.innerText = '' + player.level;
    livesEl.innerHTML = '';
    for( var i = 0; i < player.lives; ++i ){
        livesEl.innerHTML += '<i class="fa fa-heart"></i>';
    }
 
    ctx.fillStyle = opts.templateRepaint.replace( 'alp', 1 );
    ctx.fillRect( 0, 0, w, h );
 
    if( player.moveDown && player.tick - player.lastMoveTick > player.ticksParMove ){
       
        player.lastMoveTick = player.tick;
 
        player.x += player.dir;
        player.x %= calc.width;
        if( player.x < 0 )
            player.x = calc.width - 1;
 
        updatePlayerPositions();
 
    }
   
    player.hasBullet = player.tick - player.lastBulletTick > player.ticksParBullet;
 
    if( player.shootDown && player.hasBullet ){
       
        player.lastBulletTick = player.tick;
        player.hasBullet = false;
        player.bullets.push( {
                x: player.bulletX,
                y: player.y
            } );
       
    }
 
    if( /* level.bugs > 0 && */ Math.random() < .1 && player.tick - level.lastSpawn > level.spawnInterval ){
       
        level.lastSpawn = player.tick;
        --level.bugs;
        entities.push( {
            isBug: true,
            x: Math.random() * calc.width |0,
            y: 0,
            text: opts.bugs.length * Math.random() |0
        } );
 
    }
 
    entities.map( function( ent ){
       
        ent.y += level.entitySpeed;
        ent.py = ent.y |0;
 
        if( ent.invalid || ent.innocuous ){} // shut up, we're at a hackathon, I do what I want :P
        else if( ent.y >= calc.height ){
           
            ent.isBug && !ent.hit && player.loseLife();
            ent.innocuous = true;
 
        } else if( ent.py === player.y && ( (
                ( ent.x >= player.pos[ 0 ] && ent.x < player.pos[ 1 ] )
         || ( ent.x >= player.pos[ 2 ] && ent.x < player.pos[ 6 ] + player.widths[ 6 ] ) ) || (
                ( (
                    ( ent.x >= player.pos[ 0 ] && ent.x + calc.width < player.pos[ 1 ] )
            ||  ( ent.x + calc.width >= player.pos[ 2 ] && ent.x + calc.width < [ 6 ] ) )
 
            ) ) ) ){
 
            ent.isBug && player.loseLife();
            ent.innocuous = true;
 
            if( !ent.isBug && ent.x >= player.pos[ 5 ] && ent.x < player.pos[ 6 ] ){
               
                powerups[ powerups.length * Math.random() | 0 ]();
           
            }
               
        } else if( ent.isBug && ent.py === player.y && ent.x >= player.pos[ 1 ] && ent.x < player.pos[ 2 ] ){
       
            ent.isBug = false;
            ++player.entitiesKilled;
 
        }
 
 
        var color = ent.isBug ? opts.bugColor : opts.nonBugColor,
                text = ent.isBug ? opts.bugs[ ent.text ] : opts.nonBugs[ ent.text ];
 
        for( var i = 0; i < text.length; ++i ){
           
            var y = ent.py - i;
 
            displayChar( text[ i ], ent.x, y, color, true );
        }
 
    } );
 
    for( var i = 0; i < entities.length; ++i ){
       
        var ent = entities[ i ],
            text = ent.isBug ? opts.bugs[ ent.text ] : opts.nonBugs[ ent.text ];
 
        if( ent.py - text.length >= calc.height ){
           
            entities.splice( i, 1 );
            --i;
        }
    }
 
    for( var i = 0; i < player.bullets.length; ++i ){
       
        var bul = player.bullets[ i ];
 
        bul.y -= player.bulletSpeed;
        bul.py = bul.y |0;
 
        displayChar( opts.playerBullet, bul.x, bul.py, opts.playerColors[ 3 ] );
 
        for( var j = 0; j < entities.length; ++j ){
           
            if( bul.py === entities[ j ].py && bul.x === entities[ j ].x ){
                entities[ j ].hit = true;
                entities[ j ].isBug = false;
                ++player.entitiesKilled;
 
                j = entities.length;
 
                player.bullets.splice( i, 1 );
                --i;
            }
        }
    }
 
    var color = opts.playerColors[ 0 ],
            x = player.x - 1;
 
    for( var i = 0; i < player.widths[ 0 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( opts.playerText[ 0 ][ i ], x, player.y, color );
    }
 
    color = opts.playerColors[ 1 ];
    for( i = 0; i < player.widths[ 1 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( '.', x, player.y, color );
    }
 
    color = opts.playerColors[ 2 ];
    for( i = 0;  i < player.widths[ 2 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( opts.playerText[ 1 ][ i ], x, player.y, color );
    }
 
    color = opts.playerColors[ 3 ];
    ++x;
    x %= calc.width;
    displayChar( player.hasBullet ? opts.playerBullet : ' ', x, player.y, color );
 
    color = opts.playerColors[ 4 ];
    for( i = 0; i < player.widths[ 4 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( opts.playerText[ 2 ][ i ], x, player.y, color );
    }
 
    color = opts.playerColors[ 5 ];
    for( i = 0; i < player.widths[ 5 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( '.', x, player.y, color );
    }
 
    color = opts.playerColors[ 6 ];
    for( i = 0; i < player.widths[ 6 ]; ++i ){
       
        ++x;
        x %= calc.width;
        displayChar( opts.playerText[ 3 ][ i ], x, player.y, color );
    }
}
function displayChar( char, x, y, color, rotated ){
 
    ctx.fillStyle = color;
 
    x *= opts.cellWidth;
    y *= opts.cellHeight;
 
    if( rotated ){
       
        ctx.translate( x, y );
        ctx.rotate( Math.PI / 2 );
        ctx.fillText( char, 0, 0 );
        ctx.rotate( -Math.PI / 2 );
        ctx.translate( -x, -y );
 
    } else
        ctx.fillText( char, x, y );
}
 
window.addEventListener( 'keydown', function( e ){
 
    used = true;
    if( opts.leftKeys.indexOf( e.keyCode ) > -1 ){
       
        player.ml = true;
        player.moveDown = true;
        player.dir = -1;
 
    } else if( opts.rightKeys.indexOf( e.keyCode ) > -1 ){
       
        player.mr = true;
        player.moveDown = true;
        player.dir = 1;
 
    } else if( opts.shootKeys.indexOf( e.keyCode ) > -1 ){
       
        player.shootDown = true;
   
    } else {
       
        used = false
 
    }
 
    if( used )
        e.preventDefault();
 
} );
 
 
window.addEventListener( 'keyup', function( e ){
 
    if( opts.leftKeys.indexOf( e.keyCode ) > -1 ){
       
        player.ml = false;
        player.moveDown = player.ml || player.mr;
 
    } else if( opts.rightKeys.indexOf( e.keyCode ) > -1 ){
       
        player.mr = false;
        player.moveDown = player.ml || player.mr;
 
    } else if( opts.shootKeys.indexOf( e.keyCode ) > -1 ){
       
        player.shootDown = false;
   
    } else {
       
        e.preventDefault();
 
    }
 
} );
 
init();
