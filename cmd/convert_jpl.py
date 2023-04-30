import argparse
import pathlib
import xml.etree.cElementTree as ET
import xml.dom.minidom as minidom


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


def parse_navigation(xml: ET.ElementTree, images_dir: pathlib.Path) -> None:
    images = [image for image in images_dir.glob('**/*') if image.is_file() and image.suffix.lower() == '.png']
    if len(images) < 1:
        raise ValueError("Failed to find images in the image directory")

    # Assume every camera model is in the same reference frame.
    reference_frame_tag = xml.getroot().find('./solution/image/original_camera_model/reference_frame')
    if reference_frame_tag is None:
        raise ValueError('Failed to find <reference_frame> in navigation XML')
    reference_frame = reference_frame_tag.get('name')
    if reference_frame is None:
        raise ValueError('Failed to find name attribute on <reference_frame> in navigation XML')

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

        initial_model = solution.find('./image/original_camera_model')
        if initial_model is None:
            raise ValueError('Failed to find <original_camera_model> in navigation XML')

        final_model = solution.find('./camera_model')
        if final_model is None:
            raise ValueError('Failed to find <camera_model> in navigation XML')

        camera_tag = ET.SubElement(root, 'camera', id=image_id, image=image.name, model="CAHVORE")
        initial_tag = ET.SubElement(camera_tag, 'initial')
        final_tag = ET.SubElement(camera_tag, 'final')

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

    parse_tiepoints(tiepoints_xml)
    parse_navigation(navigation_xml, images_dir)


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

    args = parser.parse_args()
    main(args)
