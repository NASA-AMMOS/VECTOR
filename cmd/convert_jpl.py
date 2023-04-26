import argparse
import pathlib
import re
import xml.etree.cElementTree as ET
import xml.dom.minidom as minidom


def parse_coordinate_system(root_tag: ET.Element, reference_frame: str, properties: dict, root_cs: str) -> None:
    current_tag = root_tag
    current_cs = root_cs

    while True:
        cs = next((properties[name] for name in properties if 'COORDINATE_SYSTEM_NAME' in properties[name] and properties[name]['COORDINATE_SYSTEM_NAME'] == current_cs), {})
        if not cs:
            raise ValueError(f'Failed to find {current_cs} inside VICAR header')


        origin_offset = cs['ORIGIN_OFFSET_VECTOR']
        origin_offset = origin_offset.lstrip('(').rstrip(')').split(',')

        origin_rotation = cs['ORIGIN_ROTATION_QUATERNION']
        origin_rotation = origin_rotation.lstrip('(').rstrip(')').split(',')

        current_cs = cs['REFERENCE_COORD_SYSTEM_NAME']
        current_tag = ET.SubElement(current_tag, 'transform', reference_frame=current_cs)
        ET.SubElement(current_tag, 'offset', x=origin_offset[0], y=origin_offset[1], z=origin_offset[2])
        ET.SubElement(current_tag, 'rotation', x=origin_rotation[1], y=origin_rotation[2], z=origin_rotation[3], w=origin_rotation[0])

        if current_cs == reference_frame:
            break


def parse_tiepoints(xml: ET.ElementTree) -> str:
    images = xml.getroot().find('./tiepoint_set/images')
    if images is None:
            raise ValueError('Failed to find <images> in tiepoint XML')

    tiepoints = xml.getroot().findall('./tiepoint_set/tiepoints/tie')

    reference_frame_tag = xml.getroot().find('./tiepoint_set/reference_frame')
    if reference_frame_tag is None:
        raise ValueError('Failed to find <reference_frame> in tiepoint XML')

    reference_frame = reference_frame_tag.get('name')
    if reference_frame is None:
        raise ValueError('Failed to find name parameter on <reference_frame> in tiepoint XML')
    reference_frame = f'{reference_frame}_FRAME'

    tracks = {}
    point_id = 0
    for tiepoint in tiepoints:
        track = tiepoint.find('track')
        if track is None:
            raise ValueError('Failed to find <track> in tiepoint XML')

        track_id = track.get('id')
        if track_id in tracks:
            current_track = tracks[track_id]

            left_key = tiepoint.get('left_key')
            if left_key is None:
                raise ValueError('Failed to find <left_key> in tiepoint XML')
            left_key = int(left_key)

            right_key = tiepoint.get('right_key')
            if right_key is None:
                raise ValueError('Failed to find <right_key> in tiepoint XML')
            right_key = int(right_key)

            if not any(point['key'] == left_key for point in current_track['points']):
                pixel = tiepoint.find('left')
                if pixel is None:
                    raise ValueError('Failed to find <left> in tiepoint XML')

                initial_residual = tiepoint.find('left_init_residual')
                if initial_residual is None:
                    raise ValueError('Failed to find <left_init_residual> in tiepoint XML')

                final_residual = tiepoint.find('left_final_residual')
                if final_residual is None:
                    raise ValueError('Failed to find <left_final_residual> in tiepoint XML')

                image = images.find(f'./image[@key="{left_key}"]')
                if image is None:
                    raise ValueError('Failed to find <image> in tiepoint XML')

                current_track['points'].append({
                    'id': str(point_id),
                    'key': left_key,
                    'camera_id': image.get('unique_id'),
                    'pixel': [pixel.get('samp'), pixel.get('line')],
                    'initial_residual': [
                        initial_residual.get('samp'),
                        initial_residual.get('line'),
                    ],
                    'final_residual': [
                        final_residual.get('samp'),
                        final_residual.get('line'),
                    ],
                })
                point_id += 1

            if not any(point['key'] == right_key for point in current_track['points']):
                pixel = tiepoint.find('right')
                if pixel is None:
                    raise ValueError('Failed to find <right> in tiepoint XML')

                initial_residual = tiepoint.find('right_init_residual')
                if initial_residual is None:
                    raise ValueError('Failed to find <right_init_residual> in tiepoint XML')

                final_residual = tiepoint.find('right_final_residual')
                if final_residual is None:
                    raise ValueError('Failed to find <right_final_residual> in tiepoint XML')

                image = images.find(f'./image[@key="{right_key}"]')
                if image is None:
                    raise ValueError('Failed to find <image> in tiepoint XML')

                current_track['points'].append({
                    'id': str(point_id),
                    'key': right_key,
                    'camera_id': image.get('unique_id'),
                    'pixel': [pixel.get('samp'), pixel.get('line')],
                    'initial_residual': [
                        initial_residual.get('samp'),
                        initial_residual.get('line'),
                    ],
                    'final_residual': [
                        final_residual.get('samp'),
                        final_residual.get('line'),
                    ],
                })
                point_id += 1
        else:
            left_key = tiepoint.get('left_key')
            if left_key is None:
                raise ValueError('Failed to find <left_key> in tiepoint XML')
            left_key = int(left_key)

            left_pixel = tiepoint.find('left')
            if left_pixel is None:
                raise ValueError('Failed to find <left> in tiepoint XML')

            left_initial_residual = tiepoint.find('left_init_residual')
            if left_initial_residual is None:
                raise ValueError('Failed to find <left_init_residual> in tiepoint XML')

            left_final_residual = tiepoint.find('left_final_residual')
            if left_final_residual is None:
                raise ValueError('Failed to find <left_final_residual> in tiepoint XML')

            left_image = images.find(f'./image[@key="{left_key}"]')
            if left_image is None:
                raise ValueError('Failed to find <image> in tiepoint XML')

            point_left = {
                'id': str(point_id),
                'key': left_key,
                'camera_id': left_image.get('unique_id'),
                'pixel': [
                    left_pixel.get('samp'),
                    left_pixel.get('line'),
                ],
                'initial_residual': [
                    left_initial_residual.get('samp'),
                    left_initial_residual.get('line'),
                ],
                'final_residual': [
                    left_final_residual.get('samp'),
                    left_final_residual.get('line'),
                ],
            }
            point_id += 1

            right_key = tiepoint.get('right_key')
            if right_key is None:
                raise ValueError('Failed to find <right_key> in tiepoint XML')
            right_key = int(right_key)

            right_pixel = tiepoint.find('right')
            if right_pixel is None:
                raise ValueError('Failed to find <right> in tiepoint XML')

            right_initial_residual = tiepoint.find('right_init_residual')
            if right_initial_residual is None:
                raise ValueError('Failed to find <right_init_residual> in tiepoint XML')

            right_final_residual = tiepoint.find('right_final_residual')
            if right_final_residual is None:
                raise ValueError('Failed to find <right_final_residual> in tiepoint XML')

            right_image = images.find(f'./image[@key="{right_key}"]')
            if right_image is None:
                raise ValueError('Failed to find <image> in tiepoint XML')

            point_right = {
                'id': str(point_id),
                'key': right_key,
                'camera_id': right_image.get('unique_id'),
                'pixel': [right_pixel.get('samp'), right_pixel.get('line')],
                'initial_residual': [
                    right_initial_residual.get('samp'),
                    right_initial_residual.get('line'),
                ],
                'final_residual': [
                    right_final_residual.get('samp'),
                    right_final_residual.get('line'),
                ],
            }
            point_id += 1

            initial_xyz = tiepoint.find('init_xyz')
            if initial_xyz is None:
                raise ValueError('Failed to find <init_xyz> in tiepoint XML')

            final_xyz = tiepoint.find('final_xyz')
            if final_xyz is None:
                raise ValueError('Failed to find <final_xyz> in tiepoint XML')

            tracks[track_id] = {
                'id': track_id,
                'initial_xyz': [
                    initial_xyz.get('x'),
                    initial_xyz.get('y'),
                    initial_xyz.get('z'),
                ],
                'final_xyz': [
                    final_xyz.get('x'),
                    final_xyz.get('y'),
                    final_xyz.get('z'),
                ],
                'points': [point_left, point_right],
            }

    root = ET.Element('vector', version='1.0', format='track', reference_frame=reference_frame)
    for track in tracks.values():
        initial_xyz = track['initial_xyz']
        final_xyz = track['final_xyz']

        track_tag = ET.SubElement(root, 'track', id=track['id'])
        ET.SubElement(track_tag, 'initial_xyz', x=initial_xyz[0], y=initial_xyz[1], z=initial_xyz[2])
        ET.SubElement(track_tag, 'final_xyz', x=final_xyz[0], y=final_xyz[1], z=final_xyz[2])

        points = track['points']
        points_tag = ET.SubElement(track_tag, 'points')
        for point in points:
            pixel = point['pixel']
            initial_residual = point['initial_residual']
            final_residual = point['final_residual']

            point_tag = ET.SubElement(points_tag, 'point', id=point['id'], camera_id=point['camera_id'])
            ET.SubElement(point_tag, 'pixel', x=pixel[0], y=pixel[1])
            ET.SubElement(point_tag, 'initial_residual', x=initial_residual[0], y=initial_residual[1])
            ET.SubElement(point_tag, 'final_residual', x=final_residual[0], y=final_residual[1])

    with open('tracks.xml', 'w') as f:
        f.write(minidom.parseString(ET.tostring(root, 'utf-8')).toprettyxml(indent='    '))

    return reference_frame


def parse_navigation(xml: ET.ElementTree, reference_frame: str, images_dir: pathlib.Path, vicar_dir: pathlib.Path) -> None:
    images = [image for image in images_dir.glob('**/*') if image.is_file() and image.suffix.lower() == '.png']
    if len(images) < 1:
        raise ValueError("Failed to find images in the image directory")

    vicar_files = [vicar for vicar in vicar_dir.glob('**/*') if vicar.is_file() and vicar.suffix.lower() in ['.vic', '.vicb']]
    if len(vicar_files) < 1:
        raise ValueError("Failed to find VICAR files in the VICAR directory")

    vicar_map = {}
    for file in vicar_files:
        with open(file, mode='rb') as f:
            data = f.read()
            match = re.search(b'LBLSIZE\\s*=\\s*(\\d+)', data)
            if match is None:
                raise ValueError('Failed to find LBLSIZE in VICAR file')

            label_size = match[1].decode('utf-8')
            f.seek(0)
            header = f.read(int(label_size)).decode('utf-8')

            matches = re.findall("\\s*([A-Z][A-Z_0-9]*)\\s*=\\s*((?:'(?:[^']*(?:'')?)*')|\\([^)]+\\)|\\S+)", header)
            if len(matches) < 1:
                raise ValueError('Failed to find header labels in VICAR file')

            system_labels = {}
            property_labels = {}
            history_labels = {}
            group = system_labels
            for match in matches:
                keyword = match[0].strip('\"').strip('\'')
                value = match[1].strip('\"').strip('\'')

                if keyword == 'PROPERTY':
                    group = {}
                    property_labels[value] = group
                elif keyword == 'TASK':
                    group = {}
                    history_labels[value] = group
                else:
                    group[keyword] = value

            vicar_map[file.name] = { 'system': system_labels, 'property': property_labels, 'history': history_labels }

    root = ET.Element('vector', version='1.0', format='camera', reference_frame=reference_frame)
    solutions = xml.getroot().findall('solution')
    for solution in solutions:
        image_tag = solution.find('image')
        if image_tag is None:
            raise ValueError('Failed to find <image> in navigation XML')

        image_id = str(image_tag.get('unique_id'))

        image = next((i for i in images if image_id[6:] in str(i)), None)
        if image is None:
            raise ValueError('Failed to find matching image to image_id parameter in navigation XML')

        vicar_file = next((i for i in vicar_files if image_id[6:] in str(i)), None)
        if vicar_file is None:
            raise ValueError('Failed to find matching image to image_id parameter in navigation XML')
        vicar_header = vicar_map[vicar_file.name]

        initial_model = solution.find('./image/original_camera_model')
        if initial_model is None:
            raise ValueError('Failed to find <original_camera_model> in navigation XML')

        final_model = solution.find('./camera_model')
        if final_model is None:
            raise ValueError('Failed to find <camera_model> in navigation XML')

        initial_reference_frame = initial_model.find('./reference_frame')
        if initial_reference_frame is None:
            raise ValueError('Failed to find <reference_frame> in navigation XML')

        final_reference_frame = final_model.find('./reference_frame')
        if final_reference_frame is None:
            raise ValueError('Failed to find <reference_frame> in navigation XML')

        initial_cs = initial_reference_frame.get('name')
        if initial_cs is None:
            raise ValueError('Failed to find name parameter in <reference_frame> in navigation XML')

        final_cs = final_reference_frame.get('name')
        if final_cs is None:
            raise ValueError('Failed to find name parameter in <reference_frame> in navigation XML')

        camera_tag = ET.SubElement(root, 'camera', id=image_id, image=image.name, model="CAHVORE")
        initial_tag = ET.SubElement(camera_tag, 'initial', reference_frame=initial_cs)
        final_tag = ET.SubElement(camera_tag, 'final', reference_frame=final_cs)

        properties = vicar_header['property']
        parse_coordinate_system(initial_tag, reference_frame, properties, initial_cs)
        parse_coordinate_system(final_tag, reference_frame, properties, final_cs)

        parameters = ['C', 'A', 'H', 'V', 'O', 'R', 'E']
        for param in parameters:
            initial_param = initial_model.find(f'./parameter[@id="{param}"]')
            if initial_param is None:
                raise ValueError('Failed to find camera parameter in navigation XML')

            final_param = final_model.find(f'./parameter[@id="{param}"]')
            if final_param is None:
                raise ValueError('Failed to find camera parameter in navigation XML')

            initial_x = str(initial_param.get('value1'))
            initial_y = str(initial_param.get('value2'))
            initial_z = str(initial_param.get('value3'))
            ET.SubElement(initial_tag, 'parameter', id=param, x=initial_x, y=initial_y, z=initial_z)

            final_x = str(final_param.get('value1'))
            final_y = str(final_param.get('value2'))
            final_z = str(final_param.get('value3'))
            ET.SubElement(final_tag, 'parameter', id=param, x=final_x, y=final_y, z=final_z)

        # Handle linearity properties.
        parameters = ['T', 'P']
        for param in parameters:
            initial_param = initial_model.find(f'./parameter[@id="{param}"]')
            if initial_param is None:
                raise ValueError('Failed to find camera parameter in navigation XML')

            final_param = final_model.find(f'./parameter[@id="{param}"]')
            if final_param is None:
                raise ValueError('Failed to find camera parameter in navigation XML')

            initial = str(initial_param.get('value'))
            ET.SubElement(initial_tag, 'parameter', id=param, v=initial)

            final = str(final_param.get('value'))
            ET.SubElement(final_tag, 'parameter', id=param, v=final)

    with open('cameras.xml', 'w') as f:
        f.write(minidom.parseString(ET.tostring(root, 'utf-8')).toprettyxml(indent='    '))


def main(args: argparse.Namespace) -> None:
    tiepoints_xml = ET.parse(args.tiepoints[0])
    navigation_xml = ET.parse(args.navigation[0])

    images_dir = args.images[0]
    vicar_dir = args.vicar[0]

    reference_frame = parse_tiepoints(tiepoints_xml)
    parse_navigation(navigation_xml, reference_frame, images_dir, vicar_dir)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process tiepoints and cameras into VECTOR format.')

    parser.add_argument(
        '-t',
        '--tiepoints',
        type=pathlib.Path,
        required=True,
        nargs=1,
    )

    parser.add_argument(
        '-n',
        '--navigation',
        type=pathlib.Path,
        required=True,
        nargs=1,
    )

    parser.add_argument(
        '-i',
        '--images',
        type=pathlib.Path,
        required=True,
        nargs=1
    )

    parser.add_argument(
        '-v',
        '--vicar',
        type=pathlib.Path,
        required=True,
        nargs=1
    )

    args = parser.parse_args()
    main(args)
