import {useCallback, useEffect, useRef, useState} from 'react';
import {TabbedShowLayout} from 'react-admin';
import SchemaIcon from '@mui/icons-material/SchemaTwoTone';
import CytoscapeComponent from 'react-cytoscapejs';
import fcose from 'cytoscape-fcose';
import cytoscape from 'cytoscape';
import './cyto.css';
import {ifddAspects, ifddUrlRest} from '../../Env';

cytoscape.use(fcose);

const layout = {
    name: 'fcose',
    quality: 'proof',
    randomize: true,
    animate: true,
    animationDuration: 200,
    fit: true,
    padding: 30,
    packComponents: true,
    samplingType: true,
    sampleSize: 25,
    nodeSeparation: 75,
    piTol: 0.0000001,
    nodeRepulsion: () => 4500,
    idealEdgeLength: () => 60,
    edgeElasticity: () => 0.45,
    nestingFactor: 0.1,
    numIter: 5500,
    tile: true,
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
    gravity: 0.25,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    gravityRange: 3.8,
    initialEnergyOnIncremental: 0.3,
};

const stylesheet = [
    {
        selector: 'node',
        style: {
            shape: 'round-rectangle',
            'corner-radius': '2px',
            content: 'data(label)',
            'font-size': '6px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': '2px',
            opacity: 0.9,
            'background-color': '#CCC',
            'background-fit': 'contain',
            color: '#222',
            'overlay-padding': '30px',
            'z-index': -10,
        },
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            opacity: 0.6,
            width: '2px',
            color: '#666',
            'line-color': '#777',
            'source-arrow-color': '#777',
            'target-arrow-color': '#777',
            label: 'data(label)',
            'text-opacity': 1.0,
            'text-rotation': 'autorotate',
            'font-size': '5px',
            'text-valign': 'center',
            'text-halign': 'center',
        },
    },
];

// REST path segment for an aspect, e.g. "product" -> "products".
const resourceOf = aspect => `${aspect}s`;

const CytoGraph = ({record}) => {
    const [elements, setElements] = useState([]);
    const [size, setSize] = useState({w: window.innerWidth, h: (window.innerHeight * 0.7) | 0});
    const cyRef = useRef(null);

    useEffect(() => {
        const onResize = () => setSize({w: window.innerWidth, h: (window.innerHeight * 0.7) | 0});
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetch(`${ifddUrlRest}/graph_data`, {
            method: 'POST',
            headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify({ids: [record.id]}),
        })
            .then(res => res.json())
            .then(data => {
                if (!cancelled) setElements(data);
            })
            .catch(error => console.error('graph_data request failed', error));
        return () => {
            cancelled = true;
        };
    }, [record.id]);

    const attachListeners = useCallback((cy) => {
        cyRef.current = cy;
        cy.minZoom(0.1);
        cy.maxZoom(5.0);

        cy.on('click', 'node', (evt) => {
            const url = evt.target.data().url;
            const parts = window.location.href.split('/');
            parts[parts.length - 3] = encodeURIComponent(url);
            const match = ifddAspects.find(aspect => url.includes(`/${resourceOf(aspect)}/`));
            if (match) {
                parts[parts.length - 4] = resourceOf(match);
            }
            window.open(parts.join('/'), '_self');
        });

        cy.on('add', (evt) => {
            ifddAspects.forEach(aspect => {
                evt.cy.elements(`node[class = "${aspect}"]`)
                    .forEach(node => node.style('background-image', `/Icons/${aspect}555.png`));
            });
            evt.cy.elements(`node[id = "${record.id}"]`)
                .forEach(node => node.style('background-color', '#c3b58b'));
            evt.cy.elements('edge[state = "passive"]')
                .forEach(edge => edge.style({
                    'line-color': '#aaaa48',
                    'source-arrow-color': '#aaaa48',
                    'target-arrow-color': '#aaaa48',
                }));
        });

        cy.layout(layout).run();
        cy.fit();
    }, [record.id]);

    return (
        <CytoscapeComponent
            elements={elements}
            style={{width: size.w, height: size.h}}
            cy={attachListeners}
            stylesheet={stylesheet}
            layout={layout}
        />
    );
};

export const cytoTab = (record) => (
    <TabbedShowLayout.Tab label="Explore" path="explore" icon={<SchemaIcon/>}>
        <CytoGraph record={record}/>
    </TabbedShowLayout.Tab>
);

export default cytoTab;
